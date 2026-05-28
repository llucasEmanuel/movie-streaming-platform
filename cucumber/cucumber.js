module.exports = {
  default: [
    "features/gerenciar_playlists_servico.feature",
    "--require-module tsx/cjs",
    "--require tests/step_definitions/gerenciar_playlists_servico.steps.ts",
  ].join(" "),
};