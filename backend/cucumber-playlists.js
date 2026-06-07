module.exports = {
  default: {
    paths: ["../features/gerenciar_playlists_servico.feature"],
    requireModule: ["ts-node/register"],
    require: ["tests/step_definitions/gerenciar_playlists_servico.steps.ts"],
    format: ["progress"],
  },
};