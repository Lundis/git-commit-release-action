const render = require('mustache').render;
const moment = require('moment');

exports.assemble = ({ template, commits }) => {
  const tmpl = template || defaultTemplate;
  const version = moment().format('YYYY-MM-DD HH:mm:ss');
  const text = render(tmpl, {
    version: version,
    commits: commits.map(c => {
      return {
        title: c.commit.message.split(/\r?\n/)[0],
        user: c.author,
      }
    })
  });
  const lines = text.split('\n');
  const title = lines[0];
  const body = lines.slice(1);

  return {
    title: title,
    body: body.join('\n')
  };
}

const defaultTemplate = `Release {{version}}
{{#commits}}
- {{title}}
{{/commits}}
`;
