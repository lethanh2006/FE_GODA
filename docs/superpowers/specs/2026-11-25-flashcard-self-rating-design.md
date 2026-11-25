# Flashcard self-rating

The user requests ✓/✕ after every flashcard, repeatable study of difficult words, end-of-round actions to repeat all cards or only unremembered cards, and a direct push for deployment.

Keep the existing Japanese-first deck card, speech and screen-fitting layout. After revealing a card, choose `Chưa thuộc` (✕) or `Đã thuộc` (✓) to advance. Remove ungraded forward navigation. Allow returning to the previous card and changing its rating. At completion, show remembered/unremembered counts, `Học lại tất cả`, and `Học từ chưa thuộc` when any remain. Repeat the difficult subset until none remain; the latest rating replaces the previous rating. Keep prior mastered words out of subset rounds. Ratings apply to this open study session. Existing backend completion/scheduling semantics stay intact.

Approach: maintain a small typed round state and session-wide latest ratings in the existing DeckFlow, sharing pure transition/filter helpers with regression tests. A backend migration/persistent mastery model and automatic endless queues add scope unnecessary for the requested end-of-round choices. Existing matching/listening games and FSRS review retain their current behavior.
