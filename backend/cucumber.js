module.exports = {
  default: {
    paths: ['../features/**/*.feature'],
    
    require: ['features/step_definitions/**/*.ts'],
    
    requireModule: ['ts-node/register'],
    
    format: ['summary', 'progress-bar'],
    publishQuiet: true
  }
};