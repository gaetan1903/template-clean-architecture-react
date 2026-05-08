#!/usr/bin/env bash
#
# Sync new commits from main to Bitbucket.
#
# How it works:
# - A local tag `bitbucket-sync` marks the last commit of `main` that was
#   already synced to Bitbucket.
# - This script cherry-picks every commit from `main` since that tag onto
#   the local `bitbucket-main` branch (which tracks `bitbucket/main`).
# - It pushes those new commits to Bitbucket and updates the tag.
#
# Result:
# - GitHub (origin) keeps its full history untouched.
# - Bitbucket starts from the initial squashed snapshot and grows with the
#   new commits you make from now on (one Bitbucket commit per main commit).
#
# Usage:
#   bun run push:bitbucket
#   ./scripts/push-bitbucket.sh
#
set -euo pipefail

REMOTE="${BITBUCKET_REMOTE:-bitbucket}"
TARGET_BRANCH="${BITBUCKET_BRANCH:-main}"
LOCAL_BRANCH="${BITBUCKET_LOCAL_BRANCH:-bitbucket-main}"
SYNC_TAG="${BITBUCKET_SYNC_TAG:-bitbucket-sync}"
SOURCE_BRANCH="${BITBUCKET_SOURCE_BRANCH:-main}"

cd "$(git rev-parse --show-toplevel)"

# Sanity checks
if ! git remote get-url "$REMOTE" >/dev/null 2>&1; then
    echo "Error: remote '$REMOTE' is not configured." >&2
    exit 1
fi

if ! git show-ref --verify --quiet "refs/heads/$LOCAL_BRANCH"; then
    echo "Error: local branch '$LOCAL_BRANCH' does not exist." >&2
    echo "       Run: git fetch $REMOTE && git checkout -b $LOCAL_BRANCH $REMOTE/$TARGET_BRANCH" >&2
    exit 1
fi

if ! git rev-parse "$SYNC_TAG" >/dev/null 2>&1; then
    echo "Error: tag '$SYNC_TAG' does not exist." >&2
    echo "       Run: git tag $SYNC_TAG $SOURCE_BRANCH   (set the starting point)" >&2
    exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
    echo "Error: working tree has uncommitted changes. Commit or stash first." >&2
    git status --short
    exit 1
fi

ORIGINAL_BRANCH="$(git branch --show-current)"
if [[ -z "$ORIGINAL_BRANCH" ]]; then
    echo "Error: detached HEAD. Checkout a branch first." >&2
    exit 1
fi

# Compute new commits to apply (oldest first)
NEW_COMMITS=$(git rev-list --reverse "${SYNC_TAG}..${SOURCE_BRANCH}")

if [[ -z "$NEW_COMMITS" ]]; then
    echo "Nothing to sync. '$SOURCE_BRANCH' has no new commits since '$SYNC_TAG'."
    exit 0
fi

COUNT=$(echo "$NEW_COMMITS" | wc -l | tr -d ' ')
echo "==> Syncing $COUNT new commit(s) from '$SOURCE_BRANCH' to '$REMOTE/$TARGET_BRANCH'"
while read -r sha; do
    echo "    $(git log --oneline -n 1 "$sha")"
done <<< "$NEW_COMMITS"

cleanup() {
    git cherry-pick --abort >/dev/null 2>&1 || true
    git checkout --quiet "$ORIGINAL_BRANCH" 2>/dev/null || true
}
trap cleanup EXIT

# Pull latest from bitbucket in case it was updated elsewhere
git fetch --quiet "$REMOTE" "$TARGET_BRANCH"
git checkout --quiet "$LOCAL_BRANCH"
git reset --quiet --hard "$REMOTE/$TARGET_BRANCH"

# Cherry-pick each new commit onto bitbucket-main
while read -r sha; do
    git cherry-pick --allow-empty "$sha"
done <<< "$NEW_COMMITS"

# Push to bitbucket
git push "$REMOTE" "$LOCAL_BRANCH:$TARGET_BRANCH"

# Update the sync tag to the latest commit on source branch
git checkout --quiet "$ORIGINAL_BRANCH"
git tag -f "$SYNC_TAG" "$SOURCE_BRANCH"

echo "==> Done. $COUNT commit(s) pushed to $REMOTE/$TARGET_BRANCH."
echo "==> Sync tag '$SYNC_TAG' now points to: $(git rev-parse --short "$SYNC_TAG")"
