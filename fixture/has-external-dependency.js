const { bar } = require('./external-dependency')

exports.foo = () => {
  bar()
}
