# Fixture: the backup folder a real UDS 6.11.0 `update --apply` leaves

`backup-manifest.json`, `CLAUDE.md` and `AGENTS.md` here are **not hand-written and not edited**: they are the
contents of the `.uds-backup-<timestamp>/` folder that `universal-dev-standards@6.11.0` (package integrity
`sha512-67CIJ56JMmk9zM3/8ADR5CDcLmPBk2alMC775kkvNz65vDXSw8oODApR0s58euFNbhKICvYv9IB7Ujh5Cn7+Sw==`) created in the project root
when `uds update --apply` migrated the two integration blocks of a project 6.11.0 had set up (2026-10-13).
They exist so a test can put an older UDS's backup beside a newer UDS's (dev-platform XSPEC-482 R11): the older
format records no `preManifestHash` / `postManifestHash`, which is why the current `uds update --rollback` can never
chain it to the backups after it.

| File | sha256 |
|---|---|
| `backup-manifest.json` | `57d529c352be03b04cdefe288bc61ac6fa1f4ea2133e5e0c34d3a625a56f5e99` |
| `CLAUDE.md` | `13bf8e4e457d7ba1e51673f9b7e721d81a208552c423b5a60f815aa667738602` |
| `AGENTS.md` | `a03b5ddc5b015ec2267fa2fb51b6692e7ae5430186fcb721a7e3f001bed31f24` |

How it was produced: in a git repo with `.claude/` and no `package.json`, `uds init --yes --content-mode minimal
--skills-location project` and then `uds update --apply --yes --offline`, both with the 6.11.0 package
(`npm install universal-dev-standards@6.11.0` in a scratch folder; HOME and XDG_* pointed at an empty directory).
Its `backupId` inside the manifest names the original folder (`.uds-backup-2026-10-13T05-53-52-485Z-0001`).
