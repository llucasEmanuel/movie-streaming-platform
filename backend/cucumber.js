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

  login: {
    paths: ["../features/user_login_service.feature"],
    require: ["tests/step_definitions/userLogin.steps.ts"],
    requireModule: ["ts-node/register"],
    format: ["summary", "progress-bar"],
    publishQuiet: true,
  },

  implemented: {
    paths: [
      '../features/MovieMetadata.feature',
      '../features/Player.feature',
      '../features/userSignUp.feature',
      '../features/recommendation.feature',
      '../features/gerenciar_playlists_servico.feature',
      '../features/user_login_service.feature',
      '../features/userDeletion.feature',
      '../features/moviesmanagement.feature',
      '../features/account.feature'
    ],
    require: ['tests/step_definitions/*.ts'],
    requireModule: ['ts-node/register']
  },

  movies: {
    paths: ['../features/moviesmanagement.feature'],
    require: ['tests/step_definitions/moviesmanagement-service.steps.ts'],
    requireModule: ['ts-node/register'],
    format: ['summary', 'progress-bar'],
    publishQuiet: true
  }
};