const render = require('mustache').render;
const moment = require('moment');

exports.assemble = ({ template, commits }) => {
  const tmpl = template || defaultTemplate;
  const version = moment().format('YYYY-MM-DD HH:mm:ss');
  const text = render(tmpl, {
    version: version,
    pulls: commits.map(pull => {
      return {
        title: pull.title,
        number: pull.number,
        assignees: pull.assignees,
        user: pull.user,
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
{{#pulls}}
- #{{number}} {{title}} {{#assignees}}@{{login}}{{/assignees}}{{^assignees}}{{#user}}@{{login}}{{/user}}{{/assignees}}
{{/pulls}}
`;
