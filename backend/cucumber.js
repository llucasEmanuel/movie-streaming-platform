module.exports = {
  default: {
    paths: ['../features/**/*.feature'],
    require: ['tests/step_definitions/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['summary', 'progress-bar'],
    publishQuiet: true
  },
  // O seu perfil personalizado aqui:
  lessl: {
    paths: [
      '../features/MovieMetadata.feature', 
      '../features/Player.feature'
    ],
    require: [
      'tests/step_definitions/metadata-steps.ts',
      'tests/step_definitions/player-steps.ts'
    ],
    requireModule: ['ts-node/register'],
    format: ['summary', 'progress-bar'],
    publishQuiet: true
  },

  implemented: {
    paths: [
      '../features/MovieMetadata.feature',
      '../features/Player.feature',
      '../features/userSignUp.feature',
      '../features/recommendation.feature',
      '../features/gerenciar_playlists_servico.feature'
    ],
    require: ['tests/step_definitions/*.ts'],
    requireModule: ['ts-node/register']
  }
};