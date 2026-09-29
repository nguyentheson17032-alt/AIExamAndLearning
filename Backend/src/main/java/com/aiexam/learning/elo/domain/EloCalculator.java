package com.aiexam.learning.elo.domain;

public final class EloCalculator {

    private EloCalculator() {}

    public static int paperRating(int targetEloMin, int targetEloMax) {
        return (int) Math.round((targetEloMin + (double) targetEloMax) / 2.0);
    }

    public static int nextRating(int userElo, int opponentElo, double score, int kFactor) {
        double expected = expectedScore(userElo, opponentElo);
        return (int) Math.round(userElo + kFactor * (score - expected));
    }

    public static double expectedScore(int userElo, int opponentElo) {
        return 1.0 / (1.0 + Math.pow(10.0, (opponentElo - userElo) / 400.0));
    }
}
