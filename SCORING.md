# Chấm điểm, xếp hạng, Elo

Bản đồ các tiêu chí đang chạy trong code. File này chỉ vị trí nguồn; không thay thế `ERD.md` (schema) hay README (cách chạy API).

Luồng chính khi nộp bài: `POST /api/v1/attempts/{id}/submit` → [`AttemptService.submit`](Backend/src/main/java/com/aiexam/learning/attempt/domain/AttemptService.java) → chấm từng câu → cộng điểm → cập nhật Elo → `rank_code` suy ra từ Elo mới.

---

## Bản đồ nhanh

| Việc | Nguồn sự thật | File |
|---|---|---|
| Thang điểm TS10 (0–10) | Hằng số + công thức Part II | [`Ts10Scoring.java`](Backend/src/main/java/com/aiexam/learning/attempt/domain/Ts10Scoring.java) |
| Điểm từng câu trên đề | Cột `paper_questions.points` | JSON import + [`PaperQuestion`](Backend/src/main/java/com/aiexam/learning/paper/domain/PaperQuestion.java) |
| Chấm khi nộp bài | Auto / AI / thang Part II | [`AttemptService.java`](Backend/src/main/java/com/aiexam/learning/attempt/domain/AttemptService.java) |
| Rank user | Suy ra từ Elo | [`RankCode.java`](Backend/src/main/java/com/aiexam/learning/user/domain/RankCode.java) |
| Elo sau khi nộp bài | Công thức Elo cổ điển, K = 24, đối thủ là mức Elo của đề | [`EloCalculator.java`](Backend/src/main/java/com/aiexam/learning/elo/domain/EloCalculator.java) |
| Elo mặc định, K-factor | Config | [`application.yml`](Backend/src/main/resources/application.yml) `app.elo` |
| Phân loại câu hỏi (difficulty / Bloom / Elo câu) | Heuristic hoặc Spring AI | [`HeuristicExamAiClient`](Backend/src/main/java/com/aiexam/learning/ai/domain/HeuristicExamAiClient.java) |
| Luyện theo Elo | Chọn câu quanh rating user | [`PracticeService.java`](Backend/src/main/java/com/aiexam/learning/paper/domain/PracticeService.java) |
| Ghi chú schema | Rank + thang TS10 | [`ERD.md`](ERD.md) mục Notes |

---

## 1. Tiêu chí chấm điểm (bài thi TS10)

Nguồn: [`Backend/src/main/java/com/aiexam/learning/attempt/domain/Ts10Scoring.java`](Backend/src/main/java/com/aiexam/learning/attempt/domain/Ts10Scoring.java)

Tổng điểm tối đa: **10.00**.

| Phần | Loại | Điểm | Cách chấm |
|---|---|---|---|
| Part I | 12 trắc nghiệm | 0.25 / câu → **3.00** | Auto: chọn đúng thì lấy đủ `points`, sai = 0 |
| Part II | 4 nhóm đúng/sai (mỗi nhóm 4 ý a–d) | Thang nhóm → **4.00** | Số ý đúng trong nhóm → điểm nhóm |
| Part III | 6 tự luận ngắn | 0.50 / câu → **3.00** | AI (hoặc heuristic nếu AI tắt) |

### Thang Part II (chính thức)

Trong `Ts10Scoring.partTwoGroupScore(correctCount)`:

| Số ý đúng trong nhóm | Điểm nhóm |
|---|---|
| 0 | 0.00 |
| 1 | 0.10 |
| 2 | 0.25 |
| 3 | 0.50 |
| 4 | 1.00 |

`AttemptService.applyPartTwoGroupScores` gom các câu cùng `groupKey` ở `PART_II`, đếm ý đúng, gán điểm nhóm rồi chia đều cho các ý đúng (phần dư vào ý cuối).

### Điểm từng câu trên đề

Hằng `PART_I_POINTS = 0.25` và `PART_III_POINTS = 0.50` nằm trong `Ts10Scoring` nhưng **không được gọi** khi chấm. Điểm thực tế lấy từ `PaperQuestion.points`, được import từ JSON:

- [`Backend/src/main/resources/data/ts10-2025-2026.json`](Backend/src/main/resources/data/ts10-2025-2026.json) — field `"points"`
- [`Ts10ExamSetImporter`](Backend/src/main/java/com/aiexam/learning/paper/domain/Ts10ExamSetImporter.java) ghi vào `paper_questions`

Khi chấm câu khách quan, `AttemptService.grade` dùng `item.getPoints()`: đúng thì cộng đúng số đó, sai thì 0. Part II ghi đè điểm sau khi áp thang nhóm.

### Chấm tự luận (Part III và essay)

1. `AttemptService.grade` gọi `ExamAiClient.grade` khi câu không phải objective.
2. Nếu `app.ai.enabled=true`: [`SpringAiExamClient`](Backend/src/main/java/com/aiexam/learning/ai/domain/SpringAiExamClient.java) + prompt [`grade-answer.st`](Backend/src/main/resources/prompts/grade-answer.st) (thang 0 → `maxPoints`).
3. Fallback / AI tắt: [`HeuristicExamAiClient.grade`](Backend/src/main/java/com/aiexam/learning/ai/domain/HeuristicExamAiClient.java)
   - Short answer: so khớp `answerKey` sau khi normalize → đủ điểm hoặc 0
   - Essay: theo độ dài (~30% / 60% / 80% `maxPoints`)

### Đề không thuộc bộ TS10

Cùng `AttemptService.grade`: trắc nghiệm auto theo `points` trên từng câu; không chạy thang Part II trừ khi `section == PART_II` và có `groupKey`. Luyện Elo gán mỗi câu **1 điểm** trong [`PracticeService`](Backend/src/main/java/com/aiexam/learning/paper/domain/PracticeService.java).

Tổng điểm attempt = tổng `AttemptAnswer.score`. `maxScore` lấy từ `Paper.maxScore()` (tổng `points` trên đề).

---

## 2. Xếp hạng user (rank)

Rank **không độc lập**. Mỗi lần Elo đổi, `User.applyElo` gọi `RankCode.fromElo`.

Nguồn: [`Backend/src/main/java/com/aiexam/learning/user/domain/RankCode.java`](Backend/src/main/java/com/aiexam/learning/user/domain/RankCode.java)

| Rank | Elo |
|---|---|
| `BRONZE` | &lt; 1000 |
| `SILVER` | 1000–1199 |
| `GOLD` | 1200–1399 |
| `PLATINUM` | 1400–1599 |
| `DIAMOND` | ≥ 1600 |

User mới: Elo **1000** → `SILVER` (`app.elo.default-rating` trong [`application.yml`](Backend/src/main/resources/application.yml), gán lúc đăng ký trong [`AuthService`](Backend/src/main/java/com/aiexam/learning/auth/domain/AuthService.java)).

Lưu DB: `users.elo_rating`, `users.rank_code` — entity [`User.java`](Backend/src/main/java/com/aiexam/learning/user/domain/User.java).

API / UI:

- `GET /api/v1/me` — [`MeController`](Backend/src/main/java/com/aiexam/learning/user/api/MeController.java)
- Rank sau attempt: `AttemptResponse.rankAfter` = `RankCode.fromElo(eloAfter)`
- Header + trang Rank: [`frontend/components/app-shell.tsx`](frontend/components/app-shell.tsx), [`frontend/app/me/page.tsx`](frontend/app/me/page.tsx)
- Type frontend: `RankCode` trong [`frontend/lib/types.ts`](frontend/lib/types.ts)

Test ngưỡng: [`RankCodeTest.java`](Backend/src/test/java/com/aiexam/learning/user/domain/RankCodeTest.java)

---

## 3. Elo user

Config: [`EloProperties`](Backend/src/main/java/com/aiexam/learning/common/config/EloProperties.java)

```yaml
app:
  elo:
    default-rating: 1000
    k-factor: 24
```

Sàn Elo khi nộp bài: **100** (`EloService.applyAttemptResult`).

Lịch sử: bảng `elo_events` — [`EloEvent.java`](Backend/src/main/java/com/aiexam/learning/elo/domain/EloEvent.java), lý do [`EloReason`](Backend/src/main/java/com/aiexam/learning/elo/domain/EloReason.java): `ATTEMPT_GRADED`, `AI_ADJUSTMENT`, `MANUAL`.

### 3.1 Mọi đề đã chấm

Trong `AttemptService.submit`, đề thuộc bộ đề và đề giáo viên tạo dùng cùng một công thức trong [`EloCalculator.nextRating`](Backend/src/main/java/com/aiexam/learning/elo/domain/EloCalculator.java):

```
paperElo = round((targetEloMin + targetEloMax) / 2)
scoreRatio = điểm / max          // Ts10Scoring.eloScore, kẹp 0–1
expected = 1 / (1 + 10^((paperElo − userElo) / 400))
Elo mới  = max(100, round(userElo + K × (scoreRatio − expected)))
```

- `K` = 24 (`app.elo.k-factor`)
- `paperElo` là mức giữa khoảng Elo giáo viên đặt trên đề. Đề TS10 import để 1000–1400 nên đối thủ là 1200. Elo từng câu không còn là đối thủ.
- Điểm đúng bằng mức kỳ vọng thì Elo đứng yên. Cao hơn thì cộng, thấp hơn thì trừ.
- Cùng mức Elo: 10/10 → +12, 5/10 → 0, 0/10 → −12.
- Ví dụ 2.45/10, user 1244, đề 1000–1400: 1244 → 1236 (−8). Đề khó hơn user (ví dụ giữa khoảng 1600) thì cùng điểm 2.45 vẫn được cộng nhẹ.

Gọi qua `EloService.applyAttemptResult`.

`ERD.md` ghi “Elo uses `score / 10`”: đó là `scoreRatio` so với mức Elo của đề.

### 3.2 AI chỉnh Elo thêm

API `POST /api/v1/ai/attempts/{id}/elo` vẫn tồn tại nhưng **không còn nút trên trang kết quả**. Elo đã được ghi lúc nộp bài; bấm AI adjustment trước đây sẽ tính `suggestedElo` rồi **ghi đè** rating (`applyAdjustment`), thành lần cộng thứ hai.

- Đề trong bộ TS10: API trả `ELO_LOCKED_TO_SCORE`.
- Đề luyện: đối thủ là mức giữa khoảng Elo của đề; heuristic `nextRating` rồi +8 nếu tỷ lệ ≥ 0.9, −6 nếu ≤ 0.3.

### 3.3 Luyện theo Elo

[`PracticeService.startPractice`](Backend/src/main/java/com/aiexam/learning/paper/domain/PracticeService.java): lấy câu `PUBLISHED` trong khoảng `[userElo − 150, userElo + 120]`, ưu tiên gần `userElo + 40`.

### 3.4 Hiển thị Elo

- Header refresh sau nộp bài: [`frontend/lib/attempt-actions.ts`](frontend/lib/attempt-actions.ts)
- Kết quả / lời giải: [`frontend/app/attempts/[id]/page.tsx`](frontend/app/attempts/[id]/page.tsx), [`solutions/page.tsx`](frontend/app/attempts/[id]/solutions/page.tsx)
- Lịch sử: `GET /api/v1/me/elo-events`

---

## 4. Xếp hạng / phân loại câu hỏi

Khác với rank user. Đây là **difficulty + Bloom + Elo của câu**.

| Enum | File |
|---|---|
| `BEGINNER` / `INTERMEDIATE` / `ADVANCED` / `EXPERT` | [`Difficulty.java`](Backend/src/main/java/com/aiexam/learning/question/domain/Difficulty.java) |
| `REMEMBER` … `CREATE` | [`BloomLevel.java`](Backend/src/main/java/com/aiexam/learning/question/domain/BloomLevel.java) |

`POST /api/v1/ai/questions/{id}/classify` → [`AiExamService.classify`](Backend/src/main/java/com/aiexam/learning/ai/domain/AiExamService.java).

Heuristic (`HeuristicExamAiClient.classify`):

| Difficulty | Elo câu gán |
|---|---|
| BEGINNER | 900 |
| INTERMEDIATE | 1100 |
| ADVANCED | 1300 |
| EXPERT | 1550 |

Bloom suy từ từ khóa stem / loại câu. Prompt LLM: [`classify-question.st`](Backend/src/main/resources/prompts/classify-question.st). Kết quả lưu `questions` + lịch sử `question_classifications`.

---

## 5. Test tương ứng

| File | Kiểm tra |
|---|---|
| [`Ts10ScoringTest.java`](Backend/src/test/java/com/aiexam/learning/attempt/domain/Ts10ScoringTest.java) | Thang Part II, `eloScore` |
| [`EloCalculatorTest.java`](Backend/src/test/java/com/aiexam/learning/elo/domain/EloCalculatorTest.java) | Công thức Elo |
| [`RankCodeTest.java`](Backend/src/test/java/com/aiexam/learning/user/domain/RankCodeTest.java) | Ngưỡng rank |
| [`HeuristicExamAiClientTest.java`](Backend/src/test/java/com/aiexam/learning/ai/domain/HeuristicExamAiClientTest.java) | Chấm short answer / classify |

---

## 6. Sửa tiêu chí thì sửa file nào

- Thang điểm TS10 → `Ts10Scoring.java` rồi test `Ts10ScoringTest`
- Cách chấm khi nộp và Elo sau nộp → `AttemptService.java` (`grade`, `applyPartTwoGroupScores`) + `EloCalculator.java`
- Bậc rank → `RankCode.fromElo`
- K-factor / Elo khởi điểm → `application.yml` + `EloProperties`
- Công thức Elo → `EloCalculator.java`
- Chấm AI / heuristic → `grade-answer.st` hoặc `HeuristicExamAiClient.grade`
- Điểm in trên từng câu đề import → `ts10-2025-2026.json` (`points`) rồi re-import
