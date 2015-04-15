var gitlog = require('../')
  , exec = require('child_process').exec
  , testRepoLocation = __dirname + '/test-repo-clone'

function execInTestDir(command, cb) {
  exec(command, { cwd: __dirname },  cb)
}

describe('gitlog', function() {

  before(function(done) {
    execInTestDir(__dirname + '/delete-repo.sh', function(error) {
      if (error) {
        return done(error)
      }
      execInTestDir(__dirname + '/create-repo.sh', done)
    })
  })

  it('throws an error when repo is not provided', function() {
    (function() {
      gitlog({}, function() {})
    }).should.throw('Repo required!')
  })

  it('throws an error when cb is not provided', function() {
    (function() {
      gitlog({ repo: 'test-repo' })
    }).should.throw('Callback required!')
  })

  it('throws an error when an unknown field is used', function() {
    var field = 'fake-field'
    ; (function() {
      gitlog({ repo: 'test-repo', fields: [ field ] }, function() {});
    }).should.throw('Unknown field: ' + field)
  })

  it('returns 20 commits from specified branch', function(done) {
    gitlog({ repo: testRepoLocation, branch: 'master', number: 100 }, function(err, commits) {
      commits.length.should.equal(19)

      done()
    })
  })

  it('defaults to 10 commits', function(done) {
    gitlog({ repo: testRepoLocation }, function(err, commits) {
      commits.length.should.equal(9)

      done()
    })
  })

  it('returns the fields requested', function(done) {
    var fields =
      [ 'hash'
      , 'abbrevHash'
      , 'treeHash'
      , 'authorName'
      , 'authorEmail'
      ]

    gitlog({ repo: testRepoLocation, fields: fields,nameStatus:false  }, function(err, commits) {
      commits[0].should.be.a('object')
      commits[0].should.have.keys(fields)

      done()
    })
  })

  it('returns a default set of fields', function(done) {
    var defaults = [ 'abbrevHash', 'hash', 'subject', 'authorName' ]

    gitlog({ repo: testRepoLocation, nameStatus:false }, function(err, commits) {
      commits[0].should.have.keys(defaults)

      done()
    })
  })
  
  it('returns nameStatus fields', function(done) {
    var defaults = [ 'abbrevHash', 'hash', 'subject', 'authorName', 'status', 'files' ]

    gitlog({ repo: testRepoLocation }, function(err, commits) {
      commits[0].should.have.keys(defaults)

      done()
    })
  })
  
  it('returns fields with "since" limit', function(done) {
    var defaults = [ 'abbrevHash', 'hash', 'subject', 'authorName', 'status', 'files' ]

    gitlog({ repo: testRepoLocation,since:'1 minutes ago' }, function(err, commits) {
      commits.length.should.equal(9)

      done()
    })
  })
  
  it('returns fields with "before" limit', function(done) {
    var defaults = [ 'abbrevHash', 'hash', 'subject', 'authorName', 'status', 'files' ]

    gitlog({ repo: testRepoLocation,before:'2001-12-01' }, function(err, commits) {
      commits.length.should.equal(0)

      done()
    })
  })
  
  
  

  it('returns commits only by author', function(done) {
    var command = 'cd ' + testRepoLocation + ' ' +
                  '&& touch new-file ' +
                  '&& git add new-file ' +
                  '&& git commit -m "New commit" ' +
                  '--author="A U Thor <author@example.com>"'

      , author = 'Dom Harrington'

    // Adding a new commit by different author
    exec(command, function() {
      gitlog({ repo: testRepoLocation, author: author }, function(err, commits) {

        commits.forEach(function(commit) {
          commit.authorName.should.equal(author)
        })

        done()
      })
    })
  })
  
  it('returns commits only by commiter', function(done) {
    var command = 'cd ' + testRepoLocation + ' ' +
                  '&& touch new-file ' +
                  '&& git add new-file ' +
                  '&& git commit -m "New commit" ' +
                  '--commiter="A U Thor <author@example.com>"'

      , commiter = 'Dom Harrington'

    // Adding a new commit by different author
    exec(command, function() {
      gitlog({ repo: testRepoLocation, commiter: commiter }, function(err, commits) {

        commits.forEach(function(commit) {
          commit.authorName.should.equal(commiter)
        })

        done()
      })
    })
  })

  after(function(done) {
    execInTestDir(__dirname + '/delete-repo.sh', function() {
      done()
    })
  })

})
