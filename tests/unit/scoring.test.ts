import { describe, it, expect } from "vitest";
import { scoreAssessment } from "@/lib/assessment/scoring";
import { DIMENSIONS, BANDS } from "@/lib/assessment/dimensions";

const strongAnswers = {
  timeline: "6m",
  why_now: "settled",
  relationship_status: "single",
  last_relationship_end: "1_3y",
  history_length: "3_7y",
  primary_difficulty: "not_serious",
  recurring_pattern: "yes_named",
  honest_reason:
    "I have been choosing people who were not actually available, and I did not want to look at why that felt comfortable to me at the time.",
  feedback_openness: 5,
  first_impression: "nothing",
  communication_style: "raise_early",
  living_situation: "own",
  location: "Lagos",
  relocation: "yes",
  career_stage: "settled",
  finances: "comfortable",
  faith: "central",
  faith_requirement: "must",
  children: "want",
  family_expectations: "interested",
  partner_qualities: ["kind", "family_oriented", "emotionally_open"],
  hard_requirements: "Must want children. Must be free to marry. Must share my faith.",
  flexible_preferences: "Would like someone who travels well.",
  age_range: "wide",
  service_level: "matching",
  budget: "full",
};

const strugglingAnswers = {
  timeline: "undecided",
  why_now: "family",
  relationship_status: "seeing_someone",
  last_relationship_end: "under_3m",
  history_length: "under_1y",
  primary_difficulty: "cant_commit",
  recurring_pattern: "never_looked",
  honest_reason: "Not sure",
  feedback_openness: 1,
  first_impression: "cold",
  communication_style: "withdraw",
  living_situation: "moving",
  location: "",
  relocation: "no",
  career_stage: "changing",
  finances: "strained",
  faith: "cultural",
  faith_requirement: "unsure",
  children: "unsure",
  family_expectations: "final",
  partner_qualities: ["attractive"],
  hard_requirements: "No",
  age_range: "narrow",
  service_level: "matching",
  budget: "starter",
};

describe("readiness scoring", () => {
  it("returns a band for every dimension", () => {
    const map = scoreAssessment(strongAnswers);
    expect(map.dimensions).toHaveLength(DIMENSIONS.length);
    for (const dimension of map.dimensions) {
      expect(BANDS).toContain(dimension.band);
    }
  });

  it("never produces an aggregate score or percentage", () => {
    const map = scoreAssessment(strongAnswers);
    const serialised = JSON.stringify(map);
    expect(serialised).not.toMatch(/"score"/);
    expect(serialised).not.toMatch(/"percent/);
    expect(map).not.toHaveProperty("total");
  });

  it("gives a first action wherever there is an obstacle, and none where there is not", () => {
    const map = scoreAssessment(strugglingAnswers);
    for (const dimension of map.dimensions) {
      if (dimension.band === "not_yet" || dimension.band === "emerging") {
        expect(dimension.firstAction).toBeTruthy();
      } else {
        expect(dimension.firstAction).toBeNull();
      }
    }
  });

  it("recommends readiness work before introductions when obstacles are real", () => {
    const map = scoreAssessment(strugglingAnswers);
    // Asked for matching, but the obstacles route them to the audit first.
    expect(["clarity-audit", "ready-in-90"]).toContain(map.recommendedProduct);
  });

  it("routes a ready client who asked for matching to matchmaking", () => {
    const map = scoreAssessment(strongAnswers);
    expect(["match", "ready-in-90"]).toContain(map.recommendedProduct);
  });

  it("does not penalise a deferred timeline into the bottom band", () => {
    const deferred = { ...strongAnswers, timeline: "undecided" };
    const map = scoreAssessment(deferred);
    const intent = map.dimensions.find((d) => d.key === "intent")!;
    expect(intent.band).not.toBe("not_yet");
  });

  it("is deterministic", () => {
    const a = scoreAssessment(strongAnswers);
    const b = scoreAssessment(strongAnswers);
    expect(a).toEqual(b);
  });

  it("handles an empty run without throwing", () => {
    const map = scoreAssessment({});
    expect(map.dimensions).toHaveLength(DIMENSIONS.length);
    expect(map.recommendedProduct).toBe("clarity-audit");
  });
});
