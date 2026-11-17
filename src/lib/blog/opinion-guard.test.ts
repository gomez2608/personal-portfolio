import { expect, test } from "vitest";
import { findIllegalOpinionEdits } from "./opinion-guard";

const BOT = "github-actions[bot]";
const HUMAN = "gomez2608";
const sha = (n: number) => `${String(n).repeat(7)}abcdef0123456789`;

test("a bot commit with the right message is ok", () =>
  expect(
    findIllegalOpinionEdits([{ sha: sha(1), author: BOT, message: "opinion: mezcla", opinions: { mezcla: "Hola." } }], {
      mezcla: null,
    }),
  ).toEqual([]));

test("a bot commit with the wrong message is flagged", () =>
  expect(
    findIllegalOpinionEdits([{ sha: sha(1), author: BOT, message: "chore: update", opinions: { mezcla: "Hola." } }], {
      mezcla: null,
    }),
  ).toEqual(["1111111 changed the opinion of mezcla"]));

test("a gomez2608 commit changing an opinion is flagged", () =>
  expect(
    findIllegalOpinionEdits(
      [
        { sha: sha(1), author: BOT, message: "opinion: mezcla", opinions: { mezcla: "Hola." } },
        { sha: sha(2), author: HUMAN, message: "opinion: mezcla", opinions: { mezcla: "Hola, editado." } },
      ],
      { mezcla: null },
    ),
  ).toEqual(["2222222 changed the opinion of mezcla"]));

test("clearing an opinion back to null by a human is flagged", () =>
  expect(
    findIllegalOpinionEdits([{ sha: sha(3), author: HUMAN, message: "fix", opinions: { mezcla: null } }], {
      mezcla: "Vieja.",
    }),
  ).toEqual(["3333333 changed the opinion of mezcla"]));

test("an unchanged opinion in other commits is ok", () =>
  expect(
    findIllegalOpinionEdits(
      [
        { sha: sha(1), author: HUMAN, message: "feat: draft", opinions: { mezcla: "Vieja.", otra: null } },
        { sha: sha(2), author: BOT, message: "opinion: otra", opinions: { mezcla: "Vieja.", otra: "Nueva." } },
        { sha: sha(3), author: HUMAN, message: "fix: typo", opinions: { mezcla: "Vieja.", otra: "Nueva." } },
      ],
      { mezcla: "Vieja." },
    ),
  ).toEqual([]));

test("a new post with a null opinion is ok", () =>
  expect(
    findIllegalOpinionEdits([{ sha: sha(1), author: HUMAN, message: "feat: post", opinions: { nuevo: null } }], {}),
  ).toEqual([]));

test("a new post's first opinion set by the bot is ok", () =>
  expect(
    findIllegalOpinionEdits(
      [
        { sha: sha(1), author: HUMAN, message: "feat: post", opinions: { nuevo: null } },
        { sha: sha(2), author: BOT, message: "opinion: nuevo", opinions: { nuevo: "Hola." } },
      ],
      {},
    ),
  ).toEqual([]));

test("a new post created with an opinion by a human is flagged", () =>
  expect(
    findIllegalOpinionEdits([{ sha: sha(4), author: HUMAN, message: "feat: post", opinions: { nuevo: "Escrita por IA." } }], {}),
  ).toEqual(["4444444 changed the opinion of nuevo"]));

test("deleting a post that had an opinion by a human is flagged", () =>
  expect(
    findIllegalOpinionEdits([{ sha: sha(5), author: HUMAN, message: "chore", opinions: {} }], { mezcla: "Vieja." }),
  ).toEqual(["5555555 changed the opinion of mezcla"]));

test("a human change after a bot commit is compared with the bot's state, not the base", () =>
  expect(
    findIllegalOpinionEdits(
      [
        { sha: sha(1), author: BOT, message: "opinion: mezcla", opinions: { mezcla: "Hola." } },
        { sha: sha(2), author: HUMAN, message: "revert", opinions: { mezcla: null } },
      ],
      { mezcla: null },
    ),
  ).toEqual(["2222222 changed the opinion of mezcla"]));

test("the message must start with 'opinion: ' exactly", () =>
  expect(
    findIllegalOpinionEdits(
      [
        { sha: sha(1), author: BOT, message: "Opinion: mezcla", opinions: { mezcla: "a" } },
        { sha: sha(2), author: BOT, message: "chore opinion: mezcla", opinions: { mezcla: "b" } },
      ],
      { mezcla: null },
    ),
  ).toEqual(["1111111 changed the opinion of mezcla", "2222222 changed the opinion of mezcla"]));
