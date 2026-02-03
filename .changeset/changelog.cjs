const TYPE_TITLES = {
  major: "Major Changes",
  minor: "Minor Changes",
  patch: "Patch Changes",
};

let seenTypes = new Set();

function resetGrouping() {
  seenTypes = new Set();
}

async function getReleaseLine(changeset, type) {
  const [firstLine, ...futureLines] = changeset.summary
    .split("\n")
    .map((line) => line.trimEnd());

  let header = "";
  if (!seenTypes.has(type)) {
    seenTypes.add(type);
    header = `### ${TYPE_TITLES[type] || "Changes"}\n`;
  }

  let body = `- ${firstLine}`;
  if (futureLines.length > 0) {
    body += `\n${futureLines.map((line) => `  ${line}`).join("\n")}`;
  }

  return `${header}${body}`;
}

async function getDependencyReleaseLine(changesets, dependenciesUpdated) {
  if (dependenciesUpdated.length === 0) {
    resetGrouping();
    return "";
  }

  const changesetLinks = changesets.map(
    (changeset) => `- Updated dependencies (${changeset.id})`
  );

  const updatedDependenciesList = dependenciesUpdated.map(
    (dependency) => `  - ${dependency.name}@${dependency.newVersion}`
  );

  resetGrouping();
  return [...changesetLinks, ...updatedDependenciesList].join("\n");
}

module.exports = {
  getReleaseLine,
  getDependencyReleaseLine,
};
