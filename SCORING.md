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

## 2. Xếp hạng user (rank) & Chuỗi bài thi thăng hạng (Promotion Series)

### 2.1 Bậc Rank và Ngưỡng Elo
| Rank | Elo | Yêu cầu bài thi thăng hạng |
|---|---|---|
| `BRONZE` | &lt; 1000 | Mức tân thủ |
| `SILVER` | 1000–1199 | Vượt qua **2 đề Easy 20 câu** (đúng $\ge 80\%$) từ Bronze |
| `GOLD` | 1200–1399 | Vượt qua **2 đề Medium 20 câu** (đúng $\ge 80\%$) từ Silver |
| `PLATINUM` | 1400–1599 | Vượt qua **2 đề Hard 15 câu** (đúng $\ge 80\%$) từ Gold |
| `DIAMOND` | ≥ 1600 | Vượt qua **2 đề Hard 20 câu** (đúng $\ge 80\%$) từ Platinum |

### 2.2 Quy tắc thăng hạng:
- **Tích lũy Elo:** Khi Elo đạt ngưỡng của Rank kế tiếp, trạng thái **"Sẵn sàng thăng hạng"** được kích hoạt.
- **Bài thi thăng hạng:** `POST /api/v1/me/promotion/start` sinh đề thi chuẩn theo độ khó và số lượng câu hỏi quy định.
- **Tiêu chuẩn đỗ:** Mỗi bài thi cần đạt $\ge 80\%$ số câu đúng. Khi tích lũy đủ **2 bài đỗ**, học sinh chính thức được nâng cấp `rank_code`.
- **Bảo lưu Rank:** Nếu Elo tăng vượt ngưỡng nhưng chưa thi đỗ chuỗi thăng hạng, Rank vẫn được giữ nguyên ở bậc hiện tại. Nếu Elo rơi sâu xuống dưới mức sàn của Rank, hệ thống sẽ giáng bậc tương ứng (`User.applyElo`).

API / UI:
- `GET /api/v1/me/promotion` — Trạng thái chuỗi thăng hạng (`PromotionController`)
- `POST /api/v1/me/promotion/start` — Bắt đầu bài thi thăng hạng (`PromotionController`)
- UI: Card Thử Thách Thăng Hạng tại [`frontend/components/promotion-challenge-card.tsx`](frontend/components/promotion-challenge-card.tsx) trên trang Cá nhân [`frontend/app/me/page.tsx`](frontend/app/me/page.tsx).

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

### 3.1 Cơ chế tính Elo nâng cao đa chiều (Advanced Multi-dimensional Elo Engine)

Khi nộp bài trong `AttemptService.submit`, hệ thống gọi qua `EloService.applyAttemptResult` kết hợp 4 cơ chế nâng cao trong [`EloCalculator.java`](Backend/src/main/java/com/aiexam/learning/elo/domain/EloCalculator.java):

1. **Cộng / Trừ Elo theo độ khó và tỷ lệ đúng sai từng câu (Difficulty & Item-based Multi-dimensional Engine)**:
   - Với mỗi câu hỏi $i$ có điểm tối đa $p_i$, điểm đạt được $s_i$, tỷ lệ làm đúng $r_i = \frac{s_i}{p_i} \in [0, 1]$, tỷ lệ sai là $(1 - r_i)$:
     - **Hệ số cộng điểm khi đúng (Đã giảm 50%):**
       - Đề / Câu Easy (`BEGINNER`): Hệ số $C_i = 0.15$ (Ví dụ: 3 câu đúng = $+0.45$ Elo)
       - Đề / Câu Medium (`INTERMEDIATE`): Hệ số $C_i = 0.20$ (Ví dụ: 20 câu đúng = $+4.0$ Elo)
       - Đề / Câu Hard (`ADVANCED` / `EXPERT`): Hệ số $C_i = 0.25$ (Ví dụ: 20 câu đúng = $+5.0$ Elo)
     - **Hệ số phạt khi làm sai:**
       - Đề / Câu Easy (`BEGINNER`): Hệ số phạt $P_i = 0.25$ (Làm sai câu dễ bị phạt nặng)
       - Đề / Câu Medium (`INTERMEDIATE`): Hệ số phạt $P_i = 0.15$
       - Đề / Câu Hard (`ADVANCED` / `EXPERT`): Hệ số phạt $P_i = 0.10$ (Làm sai câu khó bị phạt nhẹ)

2. **Hệ số tương xứng trình độ (Level Match Multiplier $M_{\text{gain}}$ & $M_{\text{penalty}}$)**:
   - **Khi cộng điểm ($M_{\text{gain}}$):** Ngăn người rank cao làm đề dễ để farm điểm:
     - Nếu $Q_{\text{elo}} \ge User_{\text{elo}}$: $M_{\text{gain}} = 1.0$.
     - Nếu $Q_{\text{elo}} < User_{\text{elo}}$: $M_{\text{gain}} = \max\left(0.05, \frac{2}{1 + 10^{(User_{\text{elo}} - Q_{\text{elo}}) / 400}}\right)$.
   - **Khi trừ điểm ($M_{\text{penalty}}$):** Phạt nặng người rank cao làm sai câu dễ:
     - Nếu $User_{\text{elo}} \le Q_{\text{elo}}$ (làm sai câu khó hơn trình độ): $M_{\text{penalty}} = \max\left(0.1, \frac{2}{1 + 10^{(Q_{\text{elo}} - User_{\text{elo}}) / 400}}\right) \le 1.0$ (giảm nhẹ phạt).
     - Nếu $User_{\text{elo}} > Q_{\text{elo}}$ (làm sai câu dưới trình độ): $M_{\text{penalty}} = \min\left(2.0, 1.0 + (1.0 - \frac{2}{1 + 10^{(User_{\text{elo}} - Q_{\text{elo}}) / 400}})\right) \ge 1.0$ (tăng nặng mức phạt).
   - Elo cơ sở nhận được: $\Delta_{\text{raw}} = \sum \left( r_i \times C_i \times M_{\text{gain}, i} - (1 - r_i) \times P_i \times M_{\text{penalty}, i} \right)$

3. **Streak Multiplier (Thưởng phong độ chuỗi bài tốt)**:
   - Nếu bài thi đạt $\Delta_{\text{raw}} > 0$ và điểm $S_{\text{total}} \ge 0.80$:
     $M_{\text{streak}} = 1.0 + \min(0.25, 0.05 \times \text{recentStreaks})$ (thưởng tối đa $+25\%$).

4. **Time-Efficiency Multiplier (Thưởng tốc độ làm bài chuẩn xác)**:
   - Nếu bài thi đạt $\Delta_{\text{raw}} > 0$, điểm $S_{\text{total}} \ge 0.70$ và thời gian hoàn thành $t_{\text{spent}}$ nằm trong khoảng $30\% - 80\%$ thời lượng đề:
     $M_{\text{time}} = 1.0 + 0.15 \times \left(1.0 - \frac{r_t - 0.30}{0.50}\right)$ (thưởng từ $0\%$ đến $+15\%$).

5. **Tổng hợp biến thiên & Cập nhật**:
   - Nếu $\Delta_{\text{raw}} > 0$: $\Delta = \Delta_{\text{raw}} \times M_{\text{streak}} \times M_{\text{time}}$.
   - Nếu $\Delta_{\text{raw}} \le 0$: $\Delta = \Delta_{\text{raw}}$ (áp dụng mức trừ).
   - $\text{Elo mới} = \max(100, \text{round}(userElo + \Delta))$

6. **Dynamic Item Calibration (Hiệu chỉnh Elo 2 chiều cho câu hỏi)**:
   - Mỗi lần học sinh làm bài, độ khó của từng câu hỏi được tự động điều chỉnh nhẹ ($K_{\text{item}} = 4$):
     $\Delta Q_i = \text{round}(4 \times ((1 - r_i) - (1 - E_i)))$
   - Giúp câu hỏi quá nhiều người làm sai sẽ tăng Elo (khó lên), và câu hỏi ai cũng làm đúng sẽ giảm Elo (dễ đi).

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
