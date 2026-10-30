// Literal transformation of accepted catalogue; see evidence/progress-c2a.
function freeze(value) { if(value && typeof value === "object") { Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
export const practiceCatalogue=freeze({
  "version": "catalogue-v1",
  "sourceSha256": "84625c3672d5b7427c93b8ddb82e32080d4f1c758d199bbca5f2cbfa739ecb71",
  "entries": [
    {
      "id": "catalogue-v1:VR:type:1",
      "section": "VR",
      "family": "type",
      "label": "True / False / Can't Tell",
      "routines": [
        {
          "id": "catalogue-v1:VR:type:1:1",
          "title": "Confirm, contradict, or leave undetermined",
          "steps": [
            "Choose six existing True / False / Can't Tell questions and keep their explanations hidden.",
            "Read each complete statement; locate its subject and a distinctive keyword or paraphrase in the passage.",
            "Read the matching sentence and adjacent context. Check the entire statement, including qualifiers, against that text.",
            "Say supported, contradicted, or neither, then select True, False, or Can't Tell respectively. For Can't Tell, name what information is missing rather than merely saying you are unsure.",
            "Open the explanation after answering; retry any item where you confused missing support with contradiction. No written notes are required."
          ],
          "dose": "Six questions, around 12 minutes; start untimed Adjustable coaching proposal; not a validated optimal dose.",
          "resource": "Your own accessible VR question bank, mini-mock or saved full-mock review, with passage, original options and its answer explanations; no provider connection or new questions.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "True / False / Can't Tell",
            "startLine": 32,
            "endLine": 45,
            "sha256": "a3b86963e7f5885fbfd27048be810135fb83e000290b767d1d76c72c61a968ac",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[2][3][6]",
            "limit": "Sources support the classification and textual-comparison technique, not this dose. A missed search is not evidence of absence."
          }
        },
        {
          "id": "catalogue-v1:VR:type:1:2",
          "title": "Separate False from Can't Tell",
          "steps": [
            "Select up to four previously reviewed statement questions whose explanations identify False or Can't Tell; hide the explanations.",
            "For each, search all relevant mentions, including paraphrases, instead of stopping at the first keyword hit.",
            "For False, point to conflicting information. For Can't Tell, identify the extra fact needed to decide the claim.",
            "Reopen the explanation and compare the actual relationship; finish with two fresh statement questions from your own bank."
          ],
          "dose": "Four review items and two fresh items, around 10 minutes Adjustable coaching proposal; not a validated optimal dose.",
          "resource": "Your own accessible VR question bank, mini-mock or saved full-mock review, with passage, original options and its answer explanations; no provider connection or new questions.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "True / False / Can't Tell",
            "startLine": 46,
            "endLine": 58,
            "sha256": "9f89a54acf674b3f2a13cb962041c20b2ef881dbb75cc51e5ce47e9f98528f4e",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[3][4][6]",
            "limit": "Review answers may be remembered; the two fresh items are a transfer check, not proof of mastery."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:VR:type:2",
      "section": "VR",
      "family": "type",
      "label": "Incomplete Statements",
      "routines": [
        {
          "id": "catalogue-v1:VR:type:2:1",
          "title": "Whole-sentence completion",
          "steps": [
            "Choose six existing incomplete-statement questions; include ordinary and negative stems if available.",
            "Read the unfinished stem through its final word and decide whether it asks for a supported completion or an exception.",
            "Use a distinctive stem word to find the passage evidence; if none is useful, use a word from each option.",
            "Mentally join the stem to each remaining ending. Check the resulting full claim, not whether the ending sounds fluent or appears somewhere in the passage.",
            "Select the ending meeting the stem's rule, then check the supplied explanation."
          ],
          "dose": "Six existing questions, around 12 minutes Adjustable coaching proposal; not a validated optimal dose.",
          "resource": "Your own accessible VR question bank, mini-mock or saved full-mock review, with passage, original options and its answer explanations; no provider connection or new questions.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Incomplete Statements",
            "startLine": 61,
            "endLine": 74,
            "sha256": "67af8bcb96c2e8111fc5513995ba3da3ecce8de4164c6d6fbac62271059b1366",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[5][9]",
            "limit": "Incomplete Statements is the requested catalogue label; Medify calls this format Incomplete questions. Adaptation preserves the required label."
          }
        },
        {
          "id": "catalogue-v1:VR:type:2:2",
          "title": "Because-link check",
          "steps": [
            "Find four existing incomplete stems containing because; skip this routine if your materials have none.",
            "Locate evidence about the named outcome and reason before deciding between endings.",
            "Read the complete stem-plus-option aloud mentally: check both the factual reason and whether the passage links it to this outcome.",
            "Reject a true but unrelated fact, reversed explanation, or causal link added by you rather than supplied by the passage.",
            "Check each explanation and retry the full sentence once before moving on."
          ],
          "dose": "Four questions, around 8 minutes Adjustable coaching proposal; not a validated optimal dose.",
          "resource": "Your own accessible VR question bank, mini-mock or saved full-mock review, with passage, original options and its answer explanations; no provider connection or new questions.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Incomplete Statements",
            "startLine": 75,
            "endLine": 88,
            "sha256": "caecc4f91f50997ea664f5e09465f1b60fb5cb86fc610309c6afd342fa756192",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[5][7]",
            "limit": "The sources support logical completion and relationship checking; the specific drill is original. Do not infer causation from simultaneous events."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:VR:type:3",
      "section": "VR",
      "family": "type",
      "label": "Reading Comprehension",
      "routines": [
        {
          "id": "catalogue-v1:VR:type:3:1",
          "title": "Option-to-evidence elimination",
          "steps": [
            "Choose two existing passage sets with multiple-choice questions.",
            "Read each stem fully and mentally identify its target: supported detail, inference, author view, or exception.",
            "For a detail question choose a distinctive stem keyword; for a generic stem take one from each option. Read nearby context after each hit.",
            "Compare options against the text for subject, scope and relationship. Eliminate contradictions and unsupported additions for positive-support questions; eliminate supported options for NOT-supported or EXCEPT-supported questions.",
            "For an inference, check the logical link required by the actual stem. For author view, distinguish the author's stance from someone else's reported view.",
            "Check supplied explanations after each set and retry only unresolved comparisons."
          ],
          "dose": "Two passage sets, around 15 minutes Adjustable coaching proposal; not a validated optimal dose.",
          "resource": "Your own accessible VR question bank, mini-mock or saved full-mock review, with passage, original options and its answer explanations; no provider connection or new questions.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Reading Comprehension",
            "startLine": 91,
            "endLine": 105,
            "sha256": "cd3d273ea8b7a84fa1cc12dd2f8ae201fc7ef6467fbd408a0e58d6e4fe8bc1f0",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[2][5][6]",
            "limit": "Reading Comprehension is the user taxonomy umbrella. Different stem demands are not interchangeable; provider claims about universal distractor patterns are not adopted."
          }
        },
        {
          "id": "catalogue-v1:VR:type:3:2",
          "title": "Final-two comparison",
          "steps": [
            "Choose four previously uncertain multiple-choice items without opening their explanations.",
            "Narrow to two options using evidence, then reread the precise passage sentences each would need.",
            "Compare their subjects, degree of certainty, time frame and added claims. For best-supported questions choose the better-supported option, not merely the softer-sounding one.",
            "For inference questions mentally trace the evidence-to-conclusion link; for negative questions keep the requested polarity in mind.",
            "Check the provider explanation, then answer two fresh items of the same stem demand."
          ],
          "dose": "Four review items plus two fresh items, around 12 minutes Adjustable coaching proposal; not a validated optimal dose.",
          "resource": "Your own accessible VR question bank, mini-mock or saved full-mock review, with passage, original options and its answer explanations; no provider connection or new questions.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Reading Comprehension",
            "startLine": 106,
            "endLine": 119,
            "sha256": "22ca2f8bd86dcca989fd8de42ece86f232e7e7f76be5683a996f90d111c8a2de",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[4][7][8]",
            "limit": "Source-guided option comparison is not evidence that all uncertain items share a cause."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:VR:reason:1",
      "section": "VR",
      "family": "reason",
      "label": "Extreme Language",
      "routines": [
        {
          "id": "catalogue-v1:VR:reason:1:1",
          "title": "Absolute-word evidence check",
          "steps": [
            "Pick six existing statement or option questions containing all, only, never, always, entirely or similarly strong wording.",
            "Identify the strong word in the claim and find the passage language addressing its scope.",
            "Check whether the text actually supports that strength, contradicts it with an exception, or leaves the wider claim undetermined.",
            "Answer using the question's rule. Do not mark an absolute automatically wrong or equate an unsupported absolute with False.",
            "Check the supplied explanation and say the exact scope difference for any mistake."
          ],
          "dose": "Six questions, around 10 minutes Adjustable coaching proposal; not a validated optimal dose.",
          "resource": "Your own accessible VR question bank, mini-mock or saved full-mock review, with passage, original options and its answer explanations; no provider connection or new questions.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Extreme Language",
            "startLine": 124,
            "endLine": 137,
            "sha256": "9c41733350ba4c12ee5acbb841728beead1c323644c8660fe2af64ab9395174e",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[6][7]",
            "limit": "Select this focus only when a review identifies an actual degree/scope mismatch. The traps source overstates automatic False rules; this drill corrects that limitation."
          }
        },
        {
          "id": "catalogue-v1:VR:reason:1:2",
          "title": "Exclusive-cause check",
          "steps": [
            "Choose four existing questions with only, solely, entirely, or a similarly exclusive explanation.",
            "Locate what the passage says caused or explained the outcome.",
            "Check whether it explicitly rules out other explanations or merely mentions one contributor.",
            "Select the answer required by the stem; distinguish lack of exclusive support from a directly contradicted causal claim.",
            "Compare with the supplied explanation and complete two fresh related items if available."
          ],
          "dose": "Four review or bank items and up to two fresh items, around 10 minutes Adjustable coaching proposal; not a validated optimal dose.",
          "resource": "Your own accessible VR question bank, mini-mock or saved full-mock review, with passage, original options and its answer explanations; no provider connection or new questions.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Extreme Language",
            "startLine": 138,
            "endLine": 151,
            "sha256": "8a6fc0ab9f88e4b9ec9e36503b45aaba8922a9cab9cde4382bc878cdce39e587",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[5][7][9]",
            "limit": "Exclusive causation is one possible extreme-language pattern, not a diagnosis from score or option wording alone."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:VR:reason:2",
      "section": "VR",
      "family": "reason",
      "label": "Outside Knowledge",
      "routines": [
        {
          "id": "catalogue-v1:VR:reason:2:1",
          "title": "Passage-only evidence boundary",
          "steps": [
            "Choose six existing questions on a topic you already know, with explanations hidden.",
            "For each candidate answer, ask what sentence or text-based inference supports it; do not supply remembered subject facts.",
            "If an option depends on a fact not given, treat that dependency as unsupported, not necessarily contradicted.",
            "Apply the actual stem rule: unsupported material may be eliminated in a positive question or be the target of a NOT-supported question.",
            "Check explanations and mentally identify any fact you imported from outside the passage."
          ],
          "dose": "Six questions, around 12 minutes Adjustable coaching proposal; not a validated optimal dose.",
          "resource": "Your own accessible VR question bank, mini-mock or saved full-mock review, with passage, original options and its answer explanations; no provider connection or new questions.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Outside Knowledge",
            "startLine": 154,
            "endLine": 167,
            "sha256": "dfc8e48f5ba7ef55ff376fc084f3f7df697857b191fceba8cd965e3993cec6c3",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[3][6][8]",
            "limit": "Choose when the learner describes using background knowledge or the recorded review shows an imported premise. Familiar topic or low score alone does not establish this cause."
          }
        },
        {
          "id": "catalogue-v1:VR:reason:2:2",
          "title": "Known-versus-shown reset",
          "steps": [
            "Reopen three reviewed questions where you used a real-world fact instead of passage evidence.",
            "Hide the explanation and mentally separate what you know about the topic from what this passage actually says.",
            "Locate the support or contradiction for the complete selected claim; if none exists, identify the missing premise.",
            "Check the answer explanation, then answer three fresh questions while pointing to passage support before committing."
          ],
          "dose": "Three review items plus three fresh items, around 10 minutes Adjustable coaching proposal; not a validated optimal dose.",
          "resource": "Your own accessible VR question bank, mini-mock or saved full-mock review, with passage, original options and its answer explanations; no provider connection or new questions.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Outside Knowledge",
            "startLine": 168,
            "endLine": 180,
            "sha256": "effa92fe48dcd130d74289a08f930fc8b48505e7c4fcf2f717950d8e18f8fa93",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[5][6][8]",
            "limit": "Original coaching adaptation; using ordinary word meanings and valid text-based inference is not prohibited outside knowledge."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:VR:reason:3",
      "section": "VR",
      "family": "reason",
      "label": "False Equivalence",
      "routines": [
        {
          "id": "catalogue-v1:VR:reason:3:1",
          "title": "Same-topic, same-meaning test",
          "steps": [
            "Select six existing questions where the options reuse passage words or closely related terms.",
            "Use the repeated word to locate the evidence, then compare the full claim's subject, action, group and time period.",
            "Ask whether the wording preserves the same relationship or merely shares the same topic.",
            "For a comparison, check both groups and the direction and strength of the comparison; decide with the actual stem rule.",
            "Check the explanation and mentally name the relationship change, if any."
          ],
          "dose": "Six questions, around 12 minutes Adjustable coaching proposal; not a validated optimal dose.",
          "resource": "Your own accessible VR question bank, mini-mock or saved full-mock review, with passage, original options and its answer explanations; no provider connection or new questions.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "False Equivalence",
            "startLine": 183,
            "endLine": 196,
            "sha256": "576fa01c7e903b5b62c886c44e4a7ab1726ca830ef83124bb81be8177689b045",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[4][7]",
            "limit": "False Equivalence is preserved exactly; providers discuss synonyms, shifts and dispersion rather than this exact error label. Confirm the learner's intended meaning before assigning an ambiguous case."
          }
        },
        {
          "id": "catalogue-v1:VR:reason:3:2",
          "title": "Two-facts-one-link check",
          "steps": [
            "Find four existing items whose claim combines two people, groups, events or findings.",
            "Locate both pieces of information, even if they appear in different paragraphs.",
            "Check whether the passage links those specific pieces in the way the option claims; check attribution rather than word overlap.",
            "Answer as supported, contradicted or undetermined according to the actual stem, then compare with the explanation.",
            "Finish with one fresh multi-entity passage set if available."
          ],
          "dose": "Four items plus one optional fresh set, around 12 minutes Adjustable coaching proposal; not a validated optimal dose.",
          "resource": "Your own accessible VR question bank, mini-mock or saved full-mock review, with passage, original options and its answer explanations; no provider connection or new questions.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "False Equivalence",
            "startLine": 197,
            "endLine": 210,
            "sha256": "736434066add598de8b8b830111466c0ee65849fede6c4c1717922b88cb5b8a0",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[4][6][7]",
            "limit": "Combining separate facts is not always an error; valid text-supported links are allowed. This is a cautious mapping of dispersion to the supplied label."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:VR:reason:4",
      "section": "VR",
      "family": "reason",
      "label": "Missed Qualifier",
      "routines": [
        {
          "id": "catalogue-v1:VR:reason:4:1",
          "title": "Qualifier echo",
          "steps": [
            "Select six existing items involving a condition, time limit, specified group, frequency, or degree of certainty.",
            "Read the relevant passage sentence mentally with emphasis on may, some, usually, unless, dates, and group restrictions.",
            "Read the statement or option with the same emphasis; compare the subject, condition and time frame as well as the main fact.",
            "Use the actual evidence to decide whether a changed qualifier contradicts the text or merely exceeds what it establishes.",
            "Check explanations and repeat the precise qualifier comparison for any error."
          ],
          "dose": "Six questions, around 10 minutes Adjustable coaching proposal; not a validated optimal dose.",
          "resource": "Your own accessible VR question bank, mini-mock or saved full-mock review, with passage, original options and its answer explanations; no provider connection or new questions.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Missed Qualifier",
            "startLine": 213,
            "endLine": 226,
            "sha256": "c9d2e65f71152301b60ef09e6332d7f7910986e3a19478c94ec6bce0aa161d99",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[4][6][7]",
            "limit": "Only use after a review identifies an overlooked modifier. Removing a qualifier is not automatically contradiction."
          }
        },
        {
          "id": "catalogue-v1:VR:reason:4:2",
          "title": "Stem-polarity reset",
          "steps": [
            "Choose six existing mixed positive and negative stems, without sorting them by answer beforehand.",
            "Before reading options, reread the full stem and silently state what it asks you to find.",
            "For NOT-supported or EXCEPT-supported stems, eliminate supported options. For LEAST stems, compare the specified degree rather than automatically choosing an unrelated option.",
            "Read the chosen option back together with the stem before submitting.",
            "Check explanations; retry any item where you followed the opposite instruction."
          ],
          "dose": "Six mixed questions, around 10 minutes Adjustable coaching proposal; not a validated optimal dose.",
          "resource": "Your own accessible VR question bank, mini-mock or saved full-mock review, with passage, original options and its answer explanations; no provider connection or new questions.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Missed Qualifier",
            "startLine": 227,
            "endLine": 240,
            "sha256": "f03eafbd9df74ed9e829b69f5847ba54a9c86fa9b110645639cc34b63232aa33",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[5][9][11]",
            "limit": "Negation is a missed qualifier only if learner review supports that account; typography is not the decision rule."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:VR:reason:5",
      "section": "VR",
      "family": "reason",
      "label": "Skim Read Error",
      "routines": [
        {
          "id": "catalogue-v1:VR:reason:5:1",
          "title": "Scan then slow the evidence window",
          "steps": [
            "Choose two existing VR passage sets.",
            "Use a brief skim only to locate the topic or structure; for each item return to the relevant text rather than answering from memory of the skim.",
            "After finding a distinctive keyword or paraphrase, read the full sentence and the sentence before and after it.",
            "Check other relevant mentions when the passage has repeated terms or multiple groups, then compare the complete claim.",
            "Check explanations and retry only the questions where your first reading dropped relevant context."
          ],
          "dose": "Two sets, around 12 minutes Adjustable coaching proposal; not a validated optimal dose.",
          "resource": "Your own accessible VR question bank, mini-mock or saved full-mock review, with passage, original options and its answer explanations; no provider connection or new questions.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Skim Read Error",
            "startLine": 243,
            "endLine": 256,
            "sha256": "8a7c06e8d87b6f52808ef714e669f96bf8b7def03b60f3c30e586537f6a6611f",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[2][4][7]",
            "limit": "A reported rushed or incomplete read supports this focus; disagreement with an answer key alone does not. Brief skimming itself is not necessarily an error."
          }
        },
        {
          "id": "catalogue-v1:VR:reason:5:2",
          "title": "Anchor-choice practice",
          "steps": [
            "Select eight existing question stems before viewing their answers.",
            "For each, choose a distinctive name, date, number or specific phrase rather than the passage's broad topic.",
            "Find the anchor or its paraphrase, then read context; if it repeats, check every occurrence relevant to the claim.",
            "Answer using the passage evidence, and check the explanation after the passage set.",
            "For a missed item, retry with a different useful anchor without increasing speed until the evidence is found accurately."
          ],
          "dose": "Eight questions, around 12 minutes Adjustable coaching proposal; not a validated optimal dose.",
          "resource": "Your own accessible VR question bank, mini-mock or saved full-mock review, with passage, original options and its answer explanations; no provider connection or new questions.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Skim Read Error",
            "startLine": 257,
            "endLine": 270,
            "sha256": "4cc8d950fc7e6931abdfefc7af58eaefca769fc7bced7a5adadd9c4108173b44",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[2][4][5]",
            "limit": "The activity trains evidence location, not a claim that scanning speed caused the original error. A deadline does not prove the answer is absent."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:VR:reason:6",
      "section": "VR",
      "family": "reason",
      "label": "Guess",
      "routines": [
        {
          "id": "catalogue-v1:VR:reason:6:1",
          "title": "Guess clarification and evidence replay",
          "steps": [
            "Optionally choose whether the guess came from time running out, not finding evidence, or being stuck between options; you may skip this choice.",
            "Select up to three questions you remember guessing, whether correct or incorrect. Keep the explanation hidden.",
            "Redo them without a timer, locating the relevant passage and checking the complete claim before choosing.",
            "Open the explanation. If time was the issue, choose the time-pressure routine; if a specific evidence mismatch emerges, you may choose the matching focus. Leave the cause unknown otherwise.",
            "Try two fresh questions of the same known type with a comfortable timer only if you want to."
          ],
          "dose": "Up to three review items and two optional fresh items, around 10 minutes Adjustable coaching proposal; not a validated optimal dose.",
          "resource": "Your own accessible VR question bank, mini-mock or saved full-mock review, with passage, original options and its answer explanations; no provider connection or new questions.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Guess",
            "startLine": 273,
            "endLine": 286,
            "sha256": "4f94c0f787ef3e622403e5d6db8d7fdf640ceeec01549ecea8eae217f27da46e",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[2][3][6]",
            "limit": "Guess records uncertainty, not a cause. Optional clarification never gates practice or saving, and a correct guess remains a correct scored answer."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:VR:reason:7",
      "section": "VR",
      "family": "reason",
      "label": "Other",
      "routines": [
        {
          "id": "catalogue-v1:VR:reason:7:1",
          "title": "One-item comparison without a diagnosis",
          "steps": [
            "Optionally say what happened in your own words or leave Other unchanged.",
            "Choose one existing item you want to revisit; hide its explanation and reread the entire stem.",
            "Locate the relevant evidence, compare the full option or statement, and answer again at your own pace.",
            "Check the supplied explanation. You may choose a more specific label if it fits your experience, but no change or written note is required.",
            "If the explanation remains unclear, leave the cause unknown and optionally ask a tutor using your own accessible item."
          ],
          "dose": "One item, around 5–8 minutes Adjustable coaching proposal; not a validated optimal dose.",
          "resource": "Your own accessible VR question bank, mini-mock or saved full-mock review, with passage, original options and its answer explanations; no provider connection or new questions.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Other",
            "startLine": 289,
            "endLine": 302,
            "sha256": "22181c42d9f4ab6239bf259bdb85cdaf269a78e910e95c0e2f76a91cbf6833c8",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[2][4][6]",
            "limit": "Other is an open label, not evidence for a particular deficit. This is a bounded review fallback, not a validated cause-specific intervention."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:DM:type:1",
      "section": "DM",
      "family": "type",
      "label": "Syllogisms",
      "routines": [
        {
          "id": "catalogue-v1:DM:type:1:1",
          "title": "Five independent evidence checks",
          "steps": [
            "Choose an existing syllogism set and cover its explanation. Mark each conclusion independently against the original premises, not against another conclusion.",
            "For each Yes, point to the same groups and relationship or a valid deduction. For each No, distinguish contradiction from information not supplied.",
            "Compare individual judgements with the explanation; keep earned marks and revisit only mismatched or unsure judgements. Reattempt one available set without viewing the explanation."
          ],
          "dose": "About 10–15 minutes or 3 existing sets; adjust to available time and material",
          "resource": "Existing accessible UCAT DM questions of the relevant format, answer explanations, and paper/noteboard; a calculator or timer only where needed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Syllogisms",
            "startLine": 309,
            "endLine": 320,
            "sha256": "5652cad4459e76b7d621f50bcf749b3a849e0cfc0bd13fe3e8fc8172c6790103",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[12][15][16]",
            "limit": "Original coaching synthesis, not a published tested drill or a proven dose. Quantity and duration are adjustable suggestions; no guaranteed threshold, score gain or mastery claim. Use only existing accessible questions and their explanations. No generated questions, invented question IDs, integrations, compulsory outcome logs or student-facing recommendation rationale. Use the official definitions already supplied with the learner’s materials, not everyday meanings or inconsistent provider examples."
          }
        },
        {
          "id": "catalogue-v1:DM:type:1:2",
          "title": "Conditional direction rehearsal",
          "steps": [
            "Select existing sets containing all, no, only or an explicit if/then relationship. First decide whether each premise is categorical; leave proportional premises out of arrow notation.",
            "Write the conditional direction in brief, then reverse and negate both terms for its contrapositive. Do not accept a converse or inverse unless a separate premise supplies it.",
            "Check each offered conclusion against those exact relationships and its explanation; use a simple diagram for relative premises instead."
          ],
          "dose": "About 10 minutes or 2–3 existing sets; adjust to available time and material",
          "resource": "Existing accessible UCAT DM questions of the relevant format, answer explanations, and paper/noteboard; a calculator or timer only where needed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Syllogisms",
            "startLine": 321,
            "endLine": 332,
            "sha256": "bb24ead1ac4fb4aeace6c51fffb4722bbe75beff77be846ca57683efba2c9736",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[12][16]",
            "limit": "Original coaching synthesis, not a published tested drill or a proven dose. Quantity and duration are adjustable suggestions; no guaranteed threshold, score gain or mastery claim. Use only existing accessible questions and their explanations. No generated questions, invented question IDs, integrations, compulsory outcome logs or student-facing recommendation rationale."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:DM:type:2",
      "section": "DM",
      "family": "type",
      "label": "Logical Puzzles",
      "routines": [
        {
          "id": "catalogue-v1:DM:type:2:1",
          "title": "Anchor-to-target deduction",
          "steps": [
            "Select an existing puzzle. Read the requested target and whether the stem asks must, could or cannot before solving.",
            "Choose ordered slots for sequencing, a pairing grid for matching, or a spatial sketch for positions. Enter explicit placements and the most restrictive clues first.",
            "Add deductions only when a rule or elimination supports them. Check whether another valid arrangement changes the target; stop when the stem is answered, then compare with the explanation."
          ],
          "dose": "About 12–15 minutes or 3 existing puzzles; adjust to available time and material",
          "resource": "Existing accessible UCAT DM questions of the relevant format, answer explanations, and paper/noteboard; a calculator or timer only where needed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Logical Puzzles",
            "startLine": 335,
            "endLine": 346,
            "sha256": "ee6295c91e4cbfe0eeac4bc664c2bc94c2980ef0819cdbb393d69f5643276bcb",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[14][17]",
            "limit": "Original coaching synthesis, not a published tested drill or a proven dose. Quantity and duration are adjustable suggestions; no guaranteed threshold, score gain or mastery claim. Use only existing accessible questions and their explanations. No generated questions, invented question IDs, integrations, compulsory outcome logs or student-facing recommendation rationale."
          }
        },
        {
          "id": "catalogue-v1:DM:type:2:2",
          "title": "Rule-to-grid fidelity",
          "steps": [
            "Choose one matching puzzle and represent every stated rule in a legible grid using consistent symbols for possible, excluded and confirmed pairings.",
            "Re-read the stimulus once and check that each rule has a matching notation. Eliminate the rest of a row or column only if the puzzle states one-to-one matching.",
            "Solve for the requested pairing, then use the explanation to inspect the first unsupported placement rather than rebuilding every correct step."
          ],
          "dose": "About 8–10 minutes or 2 puzzles; adjust to available time and material",
          "resource": "Existing accessible UCAT DM questions of the relevant format, answer explanations, and paper/noteboard; a calculator or timer only where needed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Logical Puzzles",
            "startLine": 347,
            "endLine": 358,
            "sha256": "fca620506809cb74a299cfd9269c919d5511fd0bf60a1245bd19fefe83754505",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[14][17]",
            "limit": "Original coaching synthesis, not a published tested drill or a proven dose. Quantity and duration are adjustable suggestions; no guaranteed threshold, score gain or mastery claim. Use only existing accessible questions and their explanations. No generated questions, invented question IDs, integrations, compulsory outcome logs or student-facing recommendation rationale."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:DM:type:3",
      "section": "DM",
      "family": "type",
      "label": "Recognising Assumptions (Strongest Argument)",
      "routines": [
        {
          "id": "catalogue-v1:DM:type:3:1",
          "title": "Proposal-fit elimination",
          "steps": [
            "Choose existing strongest-argument questions. Briefly identify the proposed action, the stated aim if any, and the population or scope; do not invent an unstated aim.",
            "Test each option against those exact terms. Check whether its Yes/No direction matches its reason, then look for a required unsupported bridge.",
            "Select the option that most directly addresses the proposal and compare with the explanation. Revisit any close pair by naming the changed term, scope or unsupported link; do not rank by personal agreement."
          ],
          "dose": "About 10 minutes or 4–6 existing questions; adjust to available time and material",
          "resource": "Existing accessible UCAT DM questions of the relevant format, answer explanations, and paper/noteboard; a calculator or timer only where needed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Recognising Assumptions (Strongest Argument)",
            "startLine": 361,
            "endLine": 372,
            "sha256": "d6d0d0f3d5a1a502177f67538c659202a348e2a33105e7297abcbad80070456e",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[14][15][21]",
            "limit": "Original coaching synthesis, not a published tested drill or a proven dose. Quantity and duration are adjustable suggestions; no guaranteed threshold, score gain or mastery claim. Use only existing accessible questions and their explanations. No generated questions, invented question IDs, integrations, compulsory outcome logs or student-facing recommendation rationale. Retain the combined catalogue label Recognising Assumptions (Strongest Argument). These sources teach proposal/argument evaluation, not a standalone necessary-assumption negation-test drill. Provider ties based merely on the word studies, implied goals, exact timing and success guarantees are not adopted."
          }
        },
        {
          "id": "catalogue-v1:DM:type:3:2",
          "title": "Close-pair scope check",
          "steps": [
            "Return to 2 previously unsure strongest-argument questions in existing materials, keeping the explanation covered.",
            "For the two competing options, underline what each actually claims and compare it with the stem’s action, population and stated outcome.",
            "Check support or opposition independently of personal preference, choose again, then inspect the explanation for the decisive mismatch. Do not automatically prefer an option merely because it mentions studies."
          ],
          "dose": "About 6–8 minutes or 2 questions; adjust to available time and material",
          "resource": "Existing accessible UCAT DM questions of the relevant format, answer explanations, and paper/noteboard; a calculator or timer only where needed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Recognising Assumptions (Strongest Argument)",
            "startLine": 373,
            "endLine": 384,
            "sha256": "78684801beb99effff94dc342ff1a7aad234d98b04a578941f31b6c1677c855c",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[13][21]",
            "limit": "Original coaching synthesis, not a published tested drill or a proven dose. Quantity and duration are adjustable suggestions; no guaranteed threshold, score gain or mastery claim. Use only existing accessible questions and their explanations. No generated questions, invented question IDs, integrations, compulsory outcome logs or student-facing recommendation rationale. Retain the combined catalogue label Recognising Assumptions (Strongest Argument). These sources teach proposal/argument evaluation, not a standalone necessary-assumption negation-test drill. Provider ties based merely on the word studies, implied goals, exact timing and success guarantees are not adopted."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:DM:type:4",
      "section": "DM",
      "family": "type",
      "label": "Interpreting Information",
      "routines": [
        {
          "id": "catalogue-v1:DM:type:4:1",
          "title": "Statement-to-source tracing",
          "steps": [
            "Choose existing five-judgement text, table or chart questions. For each statement, locate the exact sentence, row, series or calculation it needs.",
            "Check the time period, units, comparison direction and denominator. Give Yes only when the conclusion is supported; do not turn a rate into a count without a known base.",
            "Compare each judgement with the explanation. Retain earned marks and correct only the mismatched or unsure judgements; disregard outside knowledge and correlation-to-cause leaps."
          ],
          "dose": "About 12 minutes or 3 existing sets; adjust to available time and material",
          "resource": "Existing accessible UCAT DM questions of the relevant format, answer explanations, and paper/noteboard; a calculator or timer only where needed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Interpreting Information",
            "startLine": 387,
            "endLine": 398,
            "sha256": "f5ee3fce334740208a95b38025955e75564a34fb1f329f5958b607d67ac96eae",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[12][13][18]",
            "limit": "Original coaching synthesis, not a published tested drill or a proven dose. Quantity and duration are adjustable suggestions; no guaranteed threshold, score gain or mastery claim. Use only existing accessible questions and their explanations. No generated questions, invented question IDs, integrations, compulsory outcome logs or student-facing recommendation rationale. The conflicting some example in source 7 is excluded. Follow official supplied definitions when quantifiers matter."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:DM:type:5",
      "section": "DM",
      "family": "type",
      "label": "Venn Diagrams",
      "routines": [
        {
          "id": "catalogue-v1:DM:type:5:1",
          "title": "Disjoint-region reconstruction",
          "steps": [
            "Choose an existing numerical Venn question. Label the asked region before calculating: whole set, only, both, exactly two, at least two or neither.",
            "For two sets place the overlap before only-regions; for three sets start with the triple overlap and subtract it from inclusive pair totals only when the question gives inclusive totals.",
            "Reconcile all mutually exclusive regions with the total, then sum only the requested regions and check the explanation."
          ],
          "dose": "About 10–12 minutes or 3 diagrams; adjust to available time and material",
          "resource": "Existing accessible UCAT DM questions of the relevant format, answer explanations, and paper/noteboard; a calculator or timer only where needed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Venn Diagrams",
            "startLine": 401,
            "endLine": 412,
            "sha256": "a7cc6cc5559cea3a60eb3b68237f3a3b4ffa18d4db48d04a0c84931a53108ce7",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[13][19]",
            "limit": "Original coaching synthesis, not a published tested drill or a proven dose. Quantity and duration are adjustable suggestions; no guaranteed threshold, score gain or mastery claim. Use only existing accessible questions and their explanations. No generated questions, invented question IDs, integrations, compulsory outcome logs or student-facing recommendation rationale."
          }
        },
        {
          "id": "catalogue-v1:DM:type:5:2",
          "title": "One-rule diagram elimination",
          "steps": [
            "Select existing choose-the-diagram questions. Translate each statement into an exact membership relationship using official supplied quantifier definitions.",
            "Check each candidate against one rule at a time and exclude it when that relationship fails; do not reverse a subset relation.",
            "Confirm the surviving diagram against every rule and inspect the explanation. If more than one seems to fit, return to the wording instead of adding a new assumption."
          ],
          "dose": "About 8 minutes or 3 questions; adjust to available time and material",
          "resource": "Existing accessible UCAT DM questions of the relevant format, answer explanations, and paper/noteboard; a calculator or timer only where needed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Venn Diagrams",
            "startLine": 413,
            "endLine": 424,
            "sha256": "58d120133fe8a6375cc74d8c0b0856dad4cbd4c8a015c9a6fec74bd48c2f5ba7",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[16][19]",
            "limit": "Original coaching synthesis, not a published tested drill or a proven dose. Quantity and duration are adjustable suggestions; no guaranteed threshold, score gain or mastery claim. Use only existing accessible questions and their explanations. No generated questions, invented question IDs, integrations, compulsory outcome logs or student-facing recommendation rationale."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:DM:type:6",
      "section": "DM",
      "family": "type",
      "label": "Probabilistic & Statistical Reasoning",
      "routines": [
        {
          "id": "catalogue-v1:DM:type:6:1",
          "title": "Event-and-denominator setup",
          "steps": [
            "Select existing probability questions. Identify the required event, reference group, replacement rule, dependence and whether alternatives overlap before calculating.",
            "Write the event calculation in fractions or a short tree. For dependent sequential events use the conditional second probability; for overlapping alternatives subtract their shared part.",
            "Check that the result lies in the possible probability range and answers the requested event. Compare setup and arithmetic separately with the explanation."
          ],
          "dose": "About 12 minutes or 4 existing questions; adjust to available time and material",
          "resource": "Existing accessible UCAT DM questions of the relevant format, answer explanations, and paper/noteboard; a calculator or timer only where needed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Probabilistic & Statistical Reasoning",
            "startLine": 427,
            "endLine": 438,
            "sha256": "c85f04cefc29a456049b72c0c2bd57fce5b23beaad9d947b3889ba54b0aeb7df",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[13][20]",
            "limit": "Original coaching synthesis, not a published tested drill or a proven dose. Quantity and duration are adjustable suggestions; no guaranteed threshold, score gain or mastery claim. Use only existing accessible questions and their explanations. No generated questions, invented question IDs, integrations, compulsory outcome logs or student-facing recommendation rationale."
          }
        },
        {
          "id": "catalogue-v1:DM:type:6:2",
          "title": "Same-base statistical comparison",
          "steps": [
            "Choose existing DM questions comparing rates, risks, odds or expected frequencies. Label each value’s numerator, denominator and unit.",
            "Convert only the quantities needed to a common reference frame. Separate rates from totals; use stated population sizes when totals are required and leave unavailable comparisons undetermined.",
            "Answer the given options or judgements, then compare the explanation for a denominator or metric mismatch. Preserve any correct individual judgements and their earned credit."
          ],
          "dose": "About 10 minutes or 3 existing questions; adjust to available time and material",
          "resource": "Existing accessible UCAT DM questions of the relevant format, answer explanations, and paper/noteboard; a calculator or timer only where needed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Probabilistic & Statistical Reasoning",
            "startLine": 439,
            "endLine": 450,
            "sha256": "3b26599f029d8e16cb637aab4351229f83c7c8b9d9e2062b9dc393cfda6882b7",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[18][20]",
            "limit": "Original coaching synthesis, not a published tested drill or a proven dose. Quantity and duration are adjustable suggestions; no guaranteed threshold, score gain or mastery claim. Use only existing accessible questions and their explanations. No generated questions, invented question IDs, integrations, compulsory outcome logs or student-facing recommendation rationale."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:DM:reason:1",
      "section": "DM",
      "family": "reason",
      "label": "Assumption Made",
      "routines": [
        {
          "id": "catalogue-v1:DM:reason:1:1",
          "title": "Remove the unsupported bridge",
          "steps": [
            "Use an existing DM question where your review actually identifies an assumption; cover the explanation and distinguish given facts from added beliefs in your working.",
            "Re-solve using only stated premises. For a must-be-true claim, look for a valid alternative arrangement that would make it false; for arguments, identify any missing link from reason to proposal.",
            "Check the explanation and repeat the evidence-only check on 2 available questions of the same format."
          ],
          "dose": "About 10 minutes or 1 reviewed plus 2 available questions; adjust to available time and material",
          "resource": "Existing accessible UCAT DM questions of the relevant format, answer explanations, and paper/noteboard; a calculator or timer only where needed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Assumption Made",
            "startLine": 455,
            "endLine": 466,
            "sha256": "07375e814e3194be14d609994b1ce5efb5837ed2193d52b840766854c98a9e14",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[12][17][18]",
            "limit": "Original coaching synthesis, not a published tested drill or a proven dose. Quantity and duration are adjustable suggestions; no guaranteed threshold, score gain or mastery claim. Use only existing accessible questions and their explanations. No generated questions, invented question IDs, integrations, compulsory outcome logs or student-facing recommendation rationale. The label is a learner-selected review reason, not a diagnosis from a wrong answer alone."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:DM:reason:2",
      "section": "DM",
      "family": "reason",
      "label": "Ignored Parameter",
      "routines": [
        {
          "id": "catalogue-v1:DM:reason:2:1",
          "title": "Constraint sweep before commitment",
          "steps": [
            "Take an existing question whose review identifies a missed condition. Read the stem and underline words such as only, exactly, at least, at most, without replacement and the relevant time period.",
            "Attach each condition to the affected slot, region, denominator or claim. Re-solve and check the chosen answer satisfies every relevant condition.",
            "Apply the same pre-answer sweep to 3 existing questions of that format, checking explanations afterward."
          ],
          "dose": "About 10–12 minutes or 4 existing questions; adjust to available time and material",
          "resource": "Existing accessible UCAT DM questions of the relevant format, answer explanations, and paper/noteboard; a calculator or timer only where needed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Ignored Parameter",
            "startLine": 469,
            "endLine": 480,
            "sha256": "173c6374c118709384f34466f6f50bdf8ec993921cfe82c0b42ad538da6701cd",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[17][18][19]",
            "limit": "Original coaching synthesis, not a published tested drill or a proven dose. Quantity and duration are adjustable suggestions; no guaranteed threshold, score gain or mastery claim. Use only existing accessible questions and their explanations. No generated questions, invented question IDs, integrations, compulsory outcome logs or student-facing recommendation rationale. Do not infer a missed parameter merely from an incorrect result."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:DM:reason:3",
      "section": "DM",
      "family": "reason",
      "label": "Calculation Error",
      "routines": [
        {
          "id": "catalogue-v1:DM:reason:3:1",
          "title": "Separate model from arithmetic",
          "steps": [
            "Use an existing DM numerical question with an identified arithmetic slip. Recreate the correct event, regions or denominator before using a calculator.",
            "Estimate a sensible range, write a single labelled expression, then recompute with the available calculator or written arithmetic.",
            "Compare the setup and result with the explanation. Practice the same calculation form on 2–3 available questions, keeping units and intermediate counts visible."
          ],
          "dose": "About 10 minutes or 3–4 existing questions; adjust to available time and material",
          "resource": "Existing accessible UCAT DM questions of the relevant format, answer explanations, and paper/noteboard; a calculator or timer only where needed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Calculation Error",
            "startLine": 483,
            "endLine": 494,
            "sha256": "3c6675f310b225098aa46fe33bcf82751c7f2c23b74b55b0f00b6906d256db3e",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[13][19][20]",
            "limit": "Original coaching synthesis, not a published tested drill or a proven dose. Quantity and duration are adjustable suggestions; no guaranteed threshold, score gain or mastery claim. Use only existing accessible questions and their explanations. No generated questions, invented question IDs, integrations, compulsory outcome logs or student-facing recommendation rationale. An incorrect numerical answer can reflect a wrong model rather than arithmetic; only use this routine as arithmetic remediation when the working supports that label."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:DM:reason:4",
      "section": "DM",
      "family": "reason",
      "label": "Misread Graph/Diagram",
      "routines": [
        {
          "id": "catalogue-v1:DM:reason:4:1",
          "title": "Locate before calculating",
          "steps": [
            "Choose existing chart, table or Venn questions. State the required row or region, series key, axis, scale, unit and time window before reading a value.",
            "Point to or annotate the exact value or membership region needed. Distinguish whole-set from only-regions and rates from counts before doing any arithmetic.",
            "Solve, then inspect the explanation and original display to check whether any mismatch happened during reading or later reasoning."
          ],
          "dose": "About 10 minutes or 3–4 existing questions; adjust to available time and material",
          "resource": "Existing accessible UCAT DM questions of the relevant format, answer explanations, and paper/noteboard; a calculator or timer only where needed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Misread Graph/Diagram",
            "startLine": 497,
            "endLine": 508,
            "sha256": "f6cc8e5f56c001c3baf356847140d1c36d87f0d8bfeb68d7e13020e4d1e05bea",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[18][19]",
            "limit": "Original coaching synthesis, not a published tested drill or a proven dose. Quantity and duration are adjustable suggestions; no guaranteed threshold, score gain or mastery claim. Use only existing accessible questions and their explanations. No generated questions, invented question IDs, integrations, compulsory outcome logs or student-facing recommendation rationale. Only use diagrams the learner can actually view; extracted text is not a substitute for a missing graph."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:DM:reason:5",
      "section": "DM",
      "family": "reason",
      "label": "Logical Fallacy",
      "routines": [
        {
          "id": "catalogue-v1:DM:reason:5:1",
          "title": "Check the claimed implication",
          "steps": [
            "Use a reviewed existing question where the reasoning error is explicit. Rewrite the relevant implication or study claim without changing its direction or strength.",
            "For categorical logic, test whether the rejected inference was converse, inverse or an invalid chain; for study information, distinguish association from cause; for probability, check that past independent outcomes were not treated as changing the next event.",
            "Re-answer the actual offered judgement and inspect the explanation, then apply the same check to 2 existing questions that use the relevant reasoning form."
          ],
          "dose": "About 10–12 minutes or 3 existing questions; adjust to available time and material",
          "resource": "Existing accessible UCAT DM questions of the relevant format, answer explanations, and paper/noteboard; a calculator or timer only where needed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Logical Fallacy",
            "startLine": 511,
            "endLine": 522,
            "sha256": "5645a0084957b6e5334d81a2a1bedd78641fde458430491c4d706689b02a2249",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[16][18][20]",
            "limit": "Original coaching synthesis, not a published tested drill or a proven dose. Quantity and duration are adjustable suggestions; no guaranteed threshold, score gain or mastery claim. Use only existing accessible questions and their explanations. No generated questions, invented question IDs, integrations, compulsory outcome logs or student-facing recommendation rationale. Logical Fallacy is broad; choose the branch supported by the learner’s actual working, not an automatic diagnosis or a compulsory fallacy-name exercise."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:DM:reason:6",
      "section": "DM",
      "family": "reason",
      "label": "Unable to do",
      "routines": [
        {
          "id": "catalogue-v1:DM:reason:6:1",
          "title": "Worked-method rebuild",
          "steps": [
            "Choose one existing DM question you could not start and open its explanation or a tutorial for that exact format.",
            "Identify the first usable action: map the premises, draw ordered slots or a matching grid, identify the proposal terms, locate the source values, place the overlap, or define the probability event.",
            "Cover the explanation and rebuild that question from the first step. Then try one available same-format question without the explanation; if the first step is still unclear, optionally ask a tutor about that specific step."
          ],
          "dose": "About 12–15 minutes or 1 explained question plus 1 available question; adjust to available time and material",
          "resource": "Existing accessible UCAT DM questions of the relevant format, answer explanations, and paper/noteboard; a calculator or timer only where needed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Unable to do",
            "startLine": 525,
            "endLine": 536,
            "sha256": "37d0fba932e5e90abbad9bafa6268c1d9e7f5ad8f5ca55b343680ca15f733794",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[12][14][17]",
            "limit": "Original coaching synthesis, not a published tested drill or a proven dose. Quantity and duration are adjustable suggestions; no guaranteed threshold, score gain or mastery claim. Use only existing accessible questions and their explanations. No generated questions, invented question IDs, integrations, compulsory outcome logs or student-facing recommendation rationale. Unable to do records the reported state, not ability, motivation or a specific cause."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:DM:reason:7",
      "section": "DM",
      "family": "reason",
      "label": "Guess",
      "routines": [
        {
          "id": "catalogue-v1:DM:reason:7:1",
          "title": "Optional clarification and covered-answer retry",
          "steps": [
            "Optionally clarify what you mean by Guess: no method, incomplete elimination, uncertainty between options, time pressure, or prefer not to say. Skip this question if you do not want to clarify.",
            "Reattempt one existing guessed question untimed with the answer and explanation hidden. For multi-judgement questions, inspect each judgement independently and retain the original earned marks.",
            "Compare with the explanation. If a specific difficulty becomes clear, optionally choose the matching question-type routine; otherwise use one available question of the same format without assigning a cause."
          ],
          "dose": "About 8–10 minutes or 1–2 existing questions; adjust to available time and material",
          "resource": "Existing accessible UCAT DM questions of the relevant format, answer explanations, and paper/noteboard; a calculator or timer only where needed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Guess",
            "startLine": 539,
            "endLine": 550,
            "sha256": "2080d64588c45b5d408fe45535c6a81188851ff38b2fad33ce5cb4548442f033",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[12][13][15]",
            "limit": "Original coaching synthesis, not a published tested drill or a proven dose. Quantity and duration are adjustable suggestions; no guaranteed threshold, score gain or mastery claim. Use only existing accessible questions and their explanations. No generated questions, invented question IDs, integrations, compulsory outcome logs or student-facing recommendation rationale. Guess can accompany a correct, partially correct or incorrect answer. It does not establish knowledge deficit, time pressure or any other cause; clarification and follow-up are optional."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:DM:reason:8",
      "section": "DM",
      "family": "reason",
      "label": "other",
      "routines": [
        {
          "id": "catalogue-v1:DM:reason:8:1",
          "title": "Optional concrete-step review",
          "steps": [
            "Optionally name the part that was difficult in your own words, or leave other unchanged without adding a reason.",
            "Select one existing question you want to revisit, hide its answer and explanation, and rework its stated target using the technique for its actual format.",
            "Compare with the explanation at the individual judgement or working-step level. If a clearer focus emerges, optionally choose an existing targeted routine; otherwise stop without inferring a cause or relabelling the review."
          ],
          "dose": "About 8–10 minutes or 1 existing question; adjust to available time and material",
          "resource": "Existing accessible UCAT DM questions of the relevant format, answer explanations, and paper/noteboard; a calculator or timer only where needed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "other",
            "startLine": 553,
            "endLine": 564,
            "sha256": "d12bdcde872c3419681bd8d1b44f335ac27e18352bbb9343486038d1bdaec2fe",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[12][13][15]",
            "limit": "Original coaching synthesis, not a published tested drill or a proven dose. Quantity and duration are adjustable suggestions; no guaranteed threshold, score gain or mastery claim. Use only existing accessible questions and their explanations. No generated questions, invented question IDs, integrations, compulsory outcome logs or student-facing recommendation rationale. other is preserved in lowercase. It is an unspecified review reason, not a diagnostic category; optional clarification must not block saving or practicing."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:QR:type:1",
      "section": "QR",
      "family": "type",
      "label": "Data Interpretation",
      "routines": [
        {
          "id": "catalogue-v1:QR:type:1:1",
          "title": "Two-value extraction before calculation",
          "steps": [
            "Choose an existing table set and line-graph set; read each stem before inspecting the data.",
            "Name the quantities needed, trace each to its row/column or series and axis, and keep its unit beside it.",
            "Choose the operation, estimate the result, then solve and check the supplied explanation.",
            "If an answer differs, re-extract the values before recalculating."
          ],
          "dose": "One table set and one line-graph set Adjustable original proposal; reduce or expand to suit available material. Untimed by default.",
          "resource": "Learner-owned or freely accessible existing QR material with its answer explanation; scrap paper and a calculator when needed. No provider access is assumed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Data Interpretation",
            "startLine": 571,
            "endLine": 583,
            "sha256": "0d7a059871bb2cc733dc00154d59ebf373abc09dbf15e0a174e51648947c03f9",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[29][27]",
            "limit": "Use only data and questions already in the learner’s material. Source supports the technique, not this exact drill, dose or demonstrated efficacy."
          }
        },
        {
          "id": "catalogue-v1:QR:type:1:2",
          "title": "Share is not a count",
          "steps": [
            "Choose existing pie-chart or dual-axis questions that provide both a percentage and a total.",
            "Pair every percentage with its own total and label the relevant axis or legend.",
            "Convert each requested share to a count before making an absolute comparison.",
            "Check whether the question instead asks for a percentage, and compare your answer with the explanation."
          ],
          "dose": "Two contrasting existing chart questions, followed by one fresh chart question if available Adjustable original proposal; reduce or expand to suit available material. Untimed by default.",
          "resource": "Learner-owned or freely accessible existing QR material with its answer explanation; scrap paper and a calculator when needed. No provider access is assumed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Data Interpretation",
            "startLine": 584,
            "endLine": 596,
            "sha256": "ee75c98c98338a5c4bd2fdca6fb9807525f9e3b274e4723d333f17468d9edd2e",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[29]",
            "limit": "Do not imply every chart question requires a share-to-count conversion. Source supports the technique, not this exact drill, dose or demonstrated efficacy."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:QR:type:2",
      "section": "QR",
      "family": "type",
      "label": "Percentages, Proportions & Ratios",
      "routines": [
        {
          "id": "catalogue-v1:QR:type:2:1",
          "title": "Base-and-direction sort",
          "steps": [
            "Select a mix of existing percentage-change, reverse-percentage and ratio/proportion questions.",
            "Before solving, identify the starting value, multiplier, or labelled numerator/denominator as applicable.",
            "Choose change/original, final/multiplier, part/whole or part/part; only then enter the numbers.",
            "Check the setup and answer against the explanation; redo a wrong setup without copying the solution."
          ],
          "dose": "A mixed selection containing one example of each of the four setups Adjustable original proposal; reduce or expand to suit available material. Untimed by default.",
          "resource": "Learner-owned or freely accessible existing QR material with its answer explanation; scrap paper and a calculator when needed. No provider access is assumed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Percentages, Proportions & Ratios",
            "startLine": 599,
            "endLine": 611,
            "sha256": "51e3adba95aa119ea10fd1794b43772b30f9af1679b98537f22c02951ef88fd4",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[24][25]",
            "limit": "An incorrect answer alone does not reveal which setup error occurred; use visible working or learner reflection. Source supports the technique, not this exact drill, dose or demonstrated efficacy."
          }
        },
        {
          "id": "catalogue-v1:QR:type:2:2",
          "title": "Scale from one part",
          "steps": [
            "Choose existing two-part and three-part scaling questions.",
            "Label the named parts and decide whether the supplied actual quantity is the whole or one named part.",
            "If it is the whole, divide by the sum of parts; if it is a named part, divide by that part’s ratio value.",
            "Multiply the one-part quantity by the required parts, then check that all parts sum back to the total."
          ],
          "dose": "One two-part and one three-part example, then one unfamiliar scaling example Adjustable original proposal; reduce or expand to suit available material. Untimed by default.",
          "resource": "Learner-owned or freely accessible existing QR material with its answer explanation; scrap paper and a calculator when needed. No provider access is assumed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Percentages, Proportions & Ratios",
            "startLine": 612,
            "endLine": 624,
            "sha256": "bd9b15bd46cb39c7364f2515b8930340f2bab195d0d0bc10f129d7d0660ae5ef",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[25][22]",
            "limit": "The source explicitly describes whole-to-part scaling; deriving one part from a named quantity and back-summing are original verification extensions. Source supports the technique, not this exact drill, dose or demonstrated efficacy."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:QR:type:3",
      "section": "QR",
      "family": "type",
      "label": "Rates & Conversions",
      "routines": [
        {
          "id": "catalogue-v1:QR:type:3:1",
          "title": "Unit-labelled rate chain",
          "steps": [
            "Choose existing speed/distance/time questions with mixed time or distance units.",
            "Write the target unit, read units in headings, stem and answer choices, and convert inputs into compatible units before choosing the formula.",
            "For a multi-leg journey, add distances and times separately before calculating average speed.",
            "Solve, inspect the resulting units and compare with the explanation."
          ],
          "dose": "One single-leg and one multi-leg journey; repeat only the conversion step of any mismatch Adjustable original proposal; reduce or expand to suit available material. Untimed by default.",
          "resource": "Learner-owned or freely accessible existing QR material with its answer explanation; scrap paper and a calculator when needed. No provider access is assumed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Rates & Conversions",
            "startLine": 627,
            "endLine": 639,
            "sha256": "5d62628543be927d48b664d4f188adaf2fc7f04223253b16909120c7f37ae3d0",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[22][27][31]",
            "limit": "Average speed uses total distance/total time; do not adopt the source’s overly absolute claim that averaging speeds is never valid. Source supports the technique, not this exact drill, dose or demonstrated efficacy."
          }
        },
        {
          "id": "catalogue-v1:QR:type:3:2",
          "title": "Cancel the currency units",
          "steps": [
            "Use existing currency-conversion questions that ask in opposite directions.",
            "Write each supplied rate as a factor with the target currency on top and starting currency below.",
            "Cancel the starting unit, predict whether the numeric amount should increase or decrease under that rate, then calculate.",
            "Check by reversing the conversion only when the same rate and no fees apply."
          ],
          "dose": "One forward/reverse pair from existing material; one fee-bearing example only if your material includes it Adjustable original proposal; reduce or expand to suit available material. Untimed by default.",
          "resource": "Learner-owned or freely accessible existing QR material with its answer explanation; scrap paper and a calculator when needed. No provider access is assumed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Rates & Conversions",
            "startLine": 640,
            "endLine": 652,
            "sha256": "c3ad6cdbaea37a57a5b8e960c942c56adfde346eb0eed1bada0a03185f12dbad",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[28][22]",
            "limit": "Rates and any fees come from the question, never current real-world exchange rates; reverse checks require the stated assumptions. Source supports the technique, not this exact drill, dose or demonstrated efficacy."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:QR:type:4",
      "section": "QR",
      "family": "type",
      "label": "Averages & Statistics",
      "routines": [
        {
          "id": "catalogue-v1:QR:type:4:1",
          "title": "Totals before means",
          "steps": [
            "Choose an unequal-group mean question and a missing-value mean question from existing material.",
            "Convert each given mean into a total using its group count.",
            "For combined means add totals and counts; for a missing value subtract known values from the required total.",
            "Check the combined mean lies between the group means and compare both answers with the explanations."
          ],
          "dose": "One unequal-group mean and one missing-value example; revisit a failed setup once Adjustable original proposal; reduce or expand to suit available material. Untimed by default.",
          "resource": "Learner-owned or freely accessible existing QR material with its answer explanation; scrap paper and a calculator when needed. No provider access is assumed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Averages & Statistics",
            "startLine": 655,
            "endLine": 667,
            "sha256": "9485e94feb27a63207df61231be6d764b2cf7bed10af6740c0da4223928c824b",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[23]",
            "limit": "Bounds check and this pairing are original drill design, not evaluated provider routines. Source supports the technique, not this exact drill, dose or demonstrated efficacy."
          }
        },
        {
          "id": "catalogue-v1:QR:type:4:2",
          "title": "Measure and position",
          "steps": [
            "Select existing questions using an unsorted even-sized list and a frequency table.",
            "Name the requested measure before calculating; order the list or accumulate frequencies as needed.",
            "For an even count find both central positions; for mode inspect frequencies; for range identify endpoints.",
            "Answer only the measure actually requested and check the supplied explanation."
          ],
          "dose": "One even-list median and one frequency-table question, plus one mode or range question if available Adjustable original proposal; reduce or expand to suit available material. Untimed by default.",
          "resource": "Learner-owned or freely accessible existing QR material with its answer explanation; scrap paper and a calculator when needed. No provider access is assumed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Averages & Statistics",
            "startLine": 668,
            "endLine": 680,
            "sha256": "ba646bb3d200f606a26c0a8b1f4fdbbcfbea5c4754e954c5404125bebe54355c",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[23][29]",
            "limit": "No new questions or data sets are generated; use only measures asked by the existing material. Source supports the technique, not this exact drill, dose or demonstrated efficacy."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:QR:type:5",
      "section": "QR",
      "family": "type",
      "label": "Tax & Tiered Pricing",
      "routines": [
        {
          "id": "catalogue-v1:QR:type:5:1",
          "title": "Slice the bands",
          "steps": [
            "Choose an existing progressive-tax question and, if available, a tiered-bill question.",
            "Check whether rates apply to marginal slices or to all usage once a threshold is reached; follow the supplied rule.",
            "For a marginal schedule list only the amount in each occupied band, multiply each by its rate, then sum.",
            "Complete any requested net-income, monthly or fixed-charge step and compare with the explanation."
          ],
          "dose": "One banded-tax example and one existing marginal-tier bill; use two tax examples if no bill is available Adjustable original proposal; reduce or expand to suit available material. Untimed by default.",
          "resource": "Learner-owned or freely accessible existing QR material with its answer explanation; scrap paper and a calculator when needed. No provider access is assumed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Tax & Tiered Pricing",
            "startLine": 683,
            "endLine": 695,
            "sha256": "ddd75cd2237d96f876aa61dcac126b37ecfd705c10917f3993dd246af000b9a1",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[28][22]",
            "limit": "Tax worked examples support band slicing; applying it to marginal utility pricing is an original transfer. All-units tariffs need a different setup. Source supports the technique, not this exact drill, dose or demonstrated efficacy."
          }
        },
        {
          "id": "catalogue-v1:QR:type:5:2",
          "title": "Name the final output",
          "steps": [
            "Choose existing tax/finance questions with different requested outputs.",
            "Before calculating, label the target as tax owed, net annual income, net monthly income, pre-tax price or tax-inclusive price.",
            "Calculate the tax or multiplier operation and retain intermediate values separately.",
            "Read the stem again and apply only the remaining step needed for the labelled target; check the explanation."
          ],
          "dose": "Three contrasting existing finance questions with different final outputs Adjustable original proposal; reduce or expand to suit available material. Untimed by default.",
          "resource": "Learner-owned or freely accessible existing QR material with its answer explanation; scrap paper and a calculator when needed. No provider access is assumed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Tax & Tiered Pricing",
            "startLine": 696,
            "endLine": 708,
            "sha256": "88e779fc6a6ac444adaf71bf00ed6440dceda8c9c77612ae4e2402f109bb4d76",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[28][26]",
            "limit": "VAT is a flat percentage rather than tiered pricing; include it only when the learner’s selected material tests it. Source supports the technique, not this exact drill, dose or demonstrated efficacy."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:QR:reason:1",
      "section": "QR",
      "family": "reason",
      "label": "Unit Conversion Error",
      "routines": [
        {
          "id": "catalogue-v1:QR:reason:1:1",
          "title": "Convert, cancel, then calculate",
          "steps": [
            "Return to an existing question where you identified a conversion error; underline input and requested output units.",
            "Write the given conversion as a unit-labelled factor and cancel units; distinguish length from area or volume.",
            "Re-solve and check the answer unit against the stem.",
            "Try two other existing questions with different unit families, using only supplied or checked reference conversions."
          ],
          "dose": "One reviewed conversion error plus two contrasting existing conversions Adjustable original proposal; reduce or expand to suit available material. Untimed by default.",
          "resource": "Learner-owned or freely accessible existing QR material with its answer explanation; scrap paper and a calculator when needed. No provider access is assumed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Unit Conversion Error",
            "startLine": 713,
            "endLine": 725,
            "sha256": "df37d15cf324e1087f8d83a983d35521649431eca7531f26e762ec25dcf637f3",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[22][27][31]",
            "limit": "Do not infer a conversion error merely from a wrong number; selected cause must be learner-supported. Source supports the technique, not this exact drill, dose or demonstrated efficacy."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:QR:reason:2",
      "section": "QR",
      "family": "reason",
      "label": "Calculator Typo",
      "routines": [
        {
          "id": "catalogue-v1:QR:reason:2:1",
          "title": "Input replay with checkpoints",
          "steps": [
            "Use the existing question where you noticed a calculator typo; first write the correct expression.",
            "Clear the calculator and enter it again, checking digits and decimal placement on the display before committing each operation.",
            "For a multi-step expression retain any intermediate value you cannot safely carry forward; check the result against an estimate.",
            "Repeat with three expressions taken from your existing QR explanations and compare with those answers."
          ],
          "dose": "One known typo plus three existing expressions Adjustable original proposal; reduce or expand to suit available material. Untimed by default.",
          "resource": "Learner-owned or freely accessible existing QR material with its answer explanation; scrap paper and a calculator when needed. No provider access is assumed. Use your existing on-screen practice calculator or another available calculator; do not assume identical controls.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Calculator Typo",
            "startLine": 728,
            "endLine": 740,
            "sha256": "9e4574b3f2b0c3247a1ec95dfee135d2fead8af3b9fe3e159e88276cad507f78",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[26][27]",
            "limit": "The sources support planned calculator use and sense-checks, not a validated typo treatment or guaranteed interface equivalence. Source supports the technique, not this exact drill, dose or demonstrated efficacy."
          }
        },
        {
          "id": "catalogue-v1:QR:reason:2:2",
          "title": "Keyboard sequence rehearsal",
          "steps": [
            "Choose existing QR explanation expressions with decimals, percentage multipliers and sequential operations.",
            "Break each expression into the correct mathematical order before entering it; write any intermediate quantity needed.",
            "On your available practice calculator, use keyboard entry if supported, check the displayed entry and compare the result with the supplied solution.",
            "If a digit or operator differs, clear and repeat that expression once; do not copy unverified memory-key instructions."
          ],
          "dose": "Three contrasting existing expressions, with one repeat of any mis-entered expression. Adjustable original proposal; untimed unless you explicitly choose a timing session.",
          "resource": "Existing QR explanations and an available calculator; keyboard entry is optional and interface-specific. No provider access or integration is assumed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Calculator Typo",
            "startLine": 741,
            "endLine": 753,
            "sha256": "949ef54ffdd499b820a5bd43cf286c2296be6b97de0bbdebc1251cf36dc57330",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[30][27]",
            "limit": "Source supports ordered sequential calculation and keyboard practice, not this exact drill or proven typo reduction. Shortcut, memory and feature claims are not independently verified and are not prescribed."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:QR:reason:3",
      "section": "QR",
      "family": "reason",
      "label": "Mental Math Error",
      "routines": [
        {
          "id": "catalogue-v1:QR:reason:3:1",
          "title": "Anchor and verify",
          "steps": [
            "Choose existing calculations resembling the mental step you got wrong.",
            "For percentage calculations identify the 10%, 5% or 1% anchors; for other arithmetic write the small component steps and signs.",
            "Calculate mentally, then independently check with a calculator or supplied solution.",
            "On a mismatch identify the first differing component, redo it, then attempt a fresh similar calculation from your resource."
          ],
          "dose": "Four to six existing calculation steps, including one fresh transfer step Adjustable original proposal; reduce or expand to suit available material. Untimed by default.",
          "resource": "Learner-owned or freely accessible existing QR material with its answer explanation; scrap paper and a calculator when needed. No provider access is assumed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Mental Math Error",
            "startLine": 756,
            "endLine": 768,
            "sha256": "bc8336b40e287be88e2fe3efd2071fe5e82f3e1dc720227482da363fcee2005d",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[24][27]",
            "limit": "Mental anchors are supported; the component-comparison routine is original. Do not assume calculator avoidance is always appropriate. Source supports the technique, not this exact drill, dose or demonstrated efficacy."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:QR:reason:4",
      "section": "QR",
      "family": "reason",
      "label": "Formula Forgotten",
      "routines": [
        {
          "id": "catalogue-v1:QR:reason:4:1",
          "title": "Recall one family, then apply",
          "steps": [
            "Pick the formula family you explicitly forgot and use a checked reference for that family.",
            "Cover the reference and write the relationship with each symbol and unit labelled; rearrange for the unknown in your existing question.",
            "Uncover, correct any mismatch, cover again and recall once more.",
            "Apply it to the original question and one different existing question in the same family."
          ],
          "dose": "One forgotten formula family, two recall attempts and two existing applications Adjustable original proposal; reduce or expand to suit available material. Untimed by default.",
          "resource": "Learner-owned or freely accessible existing QR material with its answer explanation; scrap paper and a calculator when needed. No provider access is assumed. A checked formula reference for the selected family.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Formula Forgotten",
            "startLine": 771,
            "endLine": 783,
            "sha256": "cc35913c9cef14f24b889bfc692b1b5f00f3ebb5dbdf41cd79d2e365ddb22dcd",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[22][23]",
            "limit": "Recall is advocated by the source; this focused dose is original and avoids adopting a whole-sheet daily prescription. Source supports the technique, not this exact drill, dose or demonstrated efficacy."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:QR:reason:5",
      "section": "QR",
      "family": "reason",
      "label": "Misread Table/Graph",
      "routines": [
        {
          "id": "catalogue-v1:QR:reason:5:1",
          "title": "Read-back before arithmetic",
          "steps": [
            "Reopen the table or chart you misread and read the stem first.",
            "Point to the required row/column or series, read its header/legend and axis scale, and read any relevant footnote.",
            "Copy only required values with units; read them back against the original source before recalculating.",
            "Repeat this extraction-first pass on a different chart format in your existing resource, then solve."
          ],
          "dose": "One misread source and one contrasting existing chart or table Adjustable original proposal; reduce or expand to suit available material. Untimed by default.",
          "resource": "Learner-owned or freely accessible existing QR material with its answer explanation; scrap paper and a calculator when needed. No provider access is assumed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Misread Table/Graph",
            "startLine": 786,
            "endLine": 798,
            "sha256": "ae8320918a24fdfdf8ad8fd8aa809d7b1ecffcf8569006a17dda87c56ce6e7af",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[29][27]",
            "limit": "Focus on observed extraction mistakes; do not assume the exact row, legend or scale error without working or reflection. Source supports the technique, not this exact drill, dose or demonstrated efficacy."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:QR:reason:6",
      "section": "QR",
      "family": "reason",
      "label": "Misread Question",
      "routines": [
        {
          "id": "catalogue-v1:QR:reason:6:1",
          "title": "Target and last-step check",
          "steps": [
            "Use the existing question whose wording you misread; restate only its target quantity, time period and output unit.",
            "Mark comparison direction or base words such as from, to, of, per, net or monthly when present.",
            "Write the operation chain and solve; compare the final result with your target statement, not merely an answer option.",
            "Attempt two existing stems with different targets, making the same target check before selecting an answer."
          ],
          "dose": "One reviewed misread stem and two contrasting existing stems Adjustable original proposal; reduce or expand to suit available material. Untimed by default.",
          "resource": "Learner-owned or freely accessible existing QR material with its answer explanation; scrap paper and a calculator when needed. No provider access is assumed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Misread Question",
            "startLine": 801,
            "endLine": 813,
            "sha256": "73b4744b29fe8713f279188b68e3f956609be3e8e84cc5e561206c4722c88cc4",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[26][27][28]",
            "limit": "This is a reading routine, not proof that wording caused all incorrect answers. Source supports the technique, not this exact drill, dose or demonstrated efficacy."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:QR:reason:7",
      "section": "QR",
      "family": "reason",
      "label": "Guess",
      "routines": [
        {
          "id": "catalogue-v1:QR:reason:7:1",
          "title": "Optional uncertainty replay",
          "steps": [
            "Choose one existing QR question you guessed and, if you want, name what you remember: unclear setup, uncertain arithmetic, time pressure, or not sure.",
            "Without a timer, identify the goal and relevant data, then attempt the setup and compare with the explanation.",
            "If you can justify eliminating an option using units or scale, say which check supports it; do not invent a reason for the original guess.",
            "Choose a matched drill only if a specific need becomes clear; otherwise stop after reviewing this question."
          ],
          "dose": "One guessed question; an optional second example only if you identify a specific need Adjustable original proposal; reduce or expand to suit available material. Untimed by default.",
          "resource": "Learner-owned or freely accessible existing QR material with its answer explanation; scrap paper and a calculator when needed. No provider access is assumed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "Guess",
            "startLine": 816,
            "endLine": 828,
            "sha256": "9191037e9be1f3cb23f7d28137bf3347dced9e0ae471188641d3222bd993e8ed",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[26][27]",
            "limit": "Guess does not establish time pressure, low ability, a formula gap or any exact cause. Clarification is optional and no logging is required. Source supports the technique, not this exact drill, dose or demonstrated efficacy."
          }
        }
      ]
    },
    {
      "id": "catalogue-v1:QR:reason:8",
      "section": "QR",
      "family": "reason",
      "label": "other",
      "routines": [
        {
          "id": "catalogue-v1:QR:reason:8:1",
          "title": "Optional first-mismatch review",
          "steps": [
            "Choose one existing QR question labelled other; optionally describe what happened in your own words or leave the cause unknown.",
            "Read the goal and needed data, then compare your original working with the supplied explanation at setup, calculation and final-output stages.",
            "If visible working shows a first mismatch, retry just that stage and then finish the question.",
            "Choose another routine only if you recognise its focus; otherwise keep other or stop without assigning a new cause."
          ],
          "dose": "One uncategorised existing question, with one optional stage-specific retry Adjustable original proposal; reduce or expand to suit available material. Untimed by default.",
          "resource": "Learner-owned or freely accessible existing QR material with its answer explanation; scrap paper and a calculator when needed. No provider access is assumed.",
          "internal": {
            "source": "practice-catalogue-researched.md",
            "heading": "other",
            "startLine": 831,
            "endLine": 843,
            "sha256": "b7168121f94f2b1f1707ef1e5839a1c60297b45e392a883239cd9830f631aac0",
            "evidenceNote": "Source-informed technique; the exact sequence and dose are coaching adaptations.[26][27]",
            "limit": "A general solve-and-check sequence supports this activity; it does not validate a catch-all diagnosis or require a label change. Source supports the technique, not this exact drill, dose or demonstrated efficacy."
          }
        }
      ]
    }
  ],
  "shared": [
    {
      "id": "catalogue-v1:shared:1",
      "title": "Incorrect — Find the first mismatch, then try a fresh item",
      "steps": [
        "Choose one existing incorrect question and keep its explanation hidden. Reattempt using its question-type routine.",
        "Compare your working with the supplied explanation: identify the first supported mismatch in reading, representation, reasoning or calculation. Leave the cause unknown if you cannot identify it.",
        "Correct that step, then attempt one fresh existing question of the same type. Do not treat remembering the old answer as proof of improvement."
      ],
      "dose": "One reviewed item plus one fresh item; around 10–15 minutes, adjustable.",
      "resource": "Accessible existing questions and their explanations; paper/calculator/timer only where relevant.",
      "internal": {
        "source": "practice-catalogue-researched.md",
        "heading": "Incorrect — Find the first mismatch, then try a fresh item",
        "startLine": 848,
        "endLine": 856,
        "sha256": "1b333c73acc3a22e995fd051c64aef0a37a7c16d10fcee7bfe40a1163fc72427",
        "evidenceNote": "",
        "limit": ""
      }
    },
    {
      "id": "catalogue-v1:shared:2",
      "title": "Partially correct — Keep earned credit; isolate uncertain judgements",
      "steps": [
        "Keep the recorded earned marks unchanged. Use an available item-level breakdown or answer explanation to identify mismatched or uncertain judgements.",
        "In DM, check those judgements independently against the original premises/data; do not assume every judgement was wrong.",
        "Try one fresh existing set of the same format. If a breakdown is unavailable, review the full set without inventing which judgements failed."
      ],
      "dose": "One reviewed set plus one optional fresh set; around 10–15 minutes, adjustable. Applies where the scoring format permits partial credit, not as a new VR/QR scoring rule.",
      "resource": "Accessible existing questions and their explanations; paper/calculator/timer only where relevant.",
      "internal": {
        "source": "practice-catalogue-researched.md",
        "heading": "Partially correct — Keep earned credit; isolate uncertain judgements",
        "startLine": 857,
        "endLine": 865,
        "sha256": "75f22e408c1b289ee207dfbc414921e1a70544e86046b2412b3eb374a55f8b77",
        "evidenceNote": "",
        "limit": ""
      }
    },
    {
      "id": "catalogue-v1:shared:3",
      "title": "Correct-but-guessed — Keep the mark; rebuild the justification",
      "steps": [
        "Keep the original earned marks. Reopen one correct-but-guessed item without its explanation.",
        "Justify the answer with passage evidence (VR), premises/constraints (DM), or a labelled calculation (QR), then compare with the explanation.",
        "Attempt one fresh existing item of the same known type. Guessing remains a confidence observation, not an inferred cause."
      ],
      "dose": "One reviewed item and one fresh item; around 8–12 minutes, adjustable.",
      "resource": "Accessible existing questions and their explanations; paper/calculator/timer only where relevant.",
      "internal": {
        "source": "practice-catalogue-researched.md",
        "heading": "Correct-but-guessed — Keep the mark; rebuild the justification",
        "startLine": 866,
        "endLine": 874,
        "sha256": "2eb2adc0dd39b7f21753e661245f253f6be7e3da9712d9fe464429baa518da1a",
        "evidenceNote": "",
        "limit": ""
      }
    },
    {
      "id": "catalogue-v1:shared:4",
      "title": "Skipped/unanswered — Try the first usable step without pressure",
      "steps": [
        "Optionally identify whether you skipped for time, uncertainty or another reason; this is not required.",
        "Attempt one skipped item untimed using its question-type routine, then compare with the explanation.",
        "Use a method-rebuild task if you explicitly cannot start. Use timed flag-and-return practice only if timing was reported or you deliberately choose it."
      ],
      "dose": "One skipped item plus one optional same-type item; around 8–12 minutes, adjustable.",
      "resource": "Accessible existing questions and their explanations; paper/calculator/timer only where relevant.",
      "internal": {
        "source": "practice-catalogue-researched.md",
        "heading": "Skipped/unanswered — Try the first usable step without pressure",
        "startLine": 875,
        "endLine": 883,
        "sha256": "ef9f21e4689834dc249a5d6ac3c9cfb7bff4b5d14b5e5d66e2e506ed8f57629c",
        "evidenceNote": "",
        "limit": ""
      }
    },
    {
      "id": "catalogue-v1:shared:5",
      "title": "Unsure — Check the decisive distinction",
      "steps": [
        "Choose one unsure item, regardless of whether it was correct, without altering its score.",
        "Name the unresolved comparison: two competing claims/options, an uncertain individual DM judgement, or a doubtful QR setup.",
        "Check the relevant passage, premises or calculation against that exact issue, then compare with the supplied explanation. Leave the cause unspecified if still unclear."
      ],
      "dose": "One or two existing items; around 6–10 minutes, adjustable.",
      "resource": "Accessible existing questions and their explanations; paper/calculator/timer only where relevant.",
      "internal": {
        "source": "practice-catalogue-researched.md",
        "heading": "Unsure — Check the decisive distinction",
        "startLine": 884,
        "endLine": 892,
        "sha256": "addb7ce8f084af2774f401d260546bc6df9018bbb6e03da29c1b107dc48deff5",
        "evidenceNote": "",
        "limit": ""
      }
    },
    {
      "id": "catalogue-v1:shared:6",
      "title": "Explicit time pressure — Personal-budget flag-and-return practice",
      "steps": [
        "Choose a small fresh set from your declared resources. Set a suitable practice budget reflecting any applicable access arrangements; there is no compulsory universal cutoff.",
        "Identify the target and first useful step. If progress stalls, choose a provisional answer and flag/mark it where the interface allows, then move on.",
        "Return with remaining time. Afterwards redo unresolved items untimed and check explanations; no compulsory written outcome log."
      ],
      "dose": "One short set plus review; around 10–20 minutes total, adjustable. Only offer for an explicit timing reflection or learner choice.",
      "resource": "Accessible existing questions and their explanations; paper/calculator/timer only where relevant.",
      "internal": {
        "source": "practice-catalogue-researched.md",
        "heading": "Explicit time pressure — Personal-budget flag-and-return practice",
        "startLine": 893,
        "endLine": 901,
        "sha256": "02cb78fd2bae00733c417e4076442d9efe0382bd51993d0cfa2f204e82082c98",
        "evidenceNote": "",
        "limit": ""
      }
    },
    {
      "id": "catalogue-v1:shared:7",
      "title": "Insufficient evidence — Optional one-item clarification—not a diagnosis",
      "steps": [
        "Choose one item to revisit, or decline the follow-up. If the type is unknown, leave it unset rather than inventing it.",
        "Compare your attempt with the source explanation at your own pace. Optionally identify the concrete step that was difficult.",
        "Select a specific routine only if the need becomes clearer or the learner chooses it. Otherwise state that a cause-specific recommendation is not supported."
      ],
      "dose": "One optional item; around 5–10 minutes, adjustable. This is a bounded review fallback, not a required task.",
      "resource": "Accessible existing questions and their explanations; paper/calculator/timer only where relevant.",
      "internal": {
        "source": "practice-catalogue-researched.md",
        "heading": "Insufficient evidence — Optional one-item clarification—not a diagnosis",
        "startLine": 902,
        "endLine": 910,
        "sha256": "8012f9bb07ef8712acdf08a37e6720e31e4b919bc4467fa493cdd98564ada236",
        "evidenceNote": "",
        "limit": ""
      }
    }
  ]
});
