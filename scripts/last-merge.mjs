// Turns the newest commit on main into { number, title } for the billboard.
export function parseLastMerge(subject, body = '') {
  const merge = subject.match(/^Merge pull request #(\d+) from \S+/);
  if (merge) {
    const title = body.split('\n').map((l) => l.trim()).find(Boolean) ?? subject;
    return { number: Number(merge[1]), title };
  }
  const squash = subject.match(/^(.*) \(#(\d+)\)$/);
  if (squash) return { number: Number(squash[2]), title: squash[1] };
  return { number: null, title: subject };
}
