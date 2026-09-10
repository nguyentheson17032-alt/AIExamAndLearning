package com.aiexam.learning.user.domain;

public enum RankCode {
    BRONZE,
    SILVER,
    GOLD,
    PLATINUM,
    DIAMOND;

    public static RankCode fromElo(int eloRating) {
        if (eloRating < 1000) {
            return BRONZE;
        }
        if (eloRating < 1200) {
            return SILVER;
        }
        if (eloRating < 1400) {
            return GOLD;
        }
        if (eloRating < 1600) {
            return PLATINUM;
        }
        return DIAMOND;
    }
}
