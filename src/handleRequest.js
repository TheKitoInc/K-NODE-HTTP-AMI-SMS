import AMI from './AMI.js';

export default async function handleRequest(req) {
  const body = await req.body;

  if (!body) throw new Error('Missing request body');

  if (!body.host) throw new Error('Missing gateway host');

  if (!body.port) throw new Error('Missing gateway port');

  if (!body.user) throw new Error('Missing gateway user');

  if (!body.password) throw new Error('Missing gateway password');

  if (!body.channel) throw new Error('Missing channel number');

  if (!body.number) throw new Error('Missing recipient number');

  if (!body.message) throw new Error('Missing message message');

  const result = await AMI.connectAndSendSMS(
    body.host,
    body.port,
    body.user,
    body.password,
    body.channel,
    body.number,
    body.message
  );
  return result;
}
