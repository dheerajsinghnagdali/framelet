const raw = process.argv[2];

if (!raw) {
  throw new Error('Usage: node scripts/release-tag.mjs <version>');
}

const version = raw.replace(/^v/, '');
const match =
  /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.exec(
    version,
  );

if (!match) {
  throw new Error(`Invalid semantic version: ${raw}`);
}

const prerelease = match[4];
const identifier = prerelease?.split('.')[0];
const namedTags = new Set(['alpha', 'beta', 'rc']);

const tag = !prerelease ? 'latest' : namedTags.has(identifier) ? identifier : 'next';

process.stdout.write(tag);
