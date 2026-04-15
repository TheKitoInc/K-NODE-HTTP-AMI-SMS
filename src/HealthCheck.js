// Kito Simple HealthCheck
// This module periodically sends a request to a specified URL to notify that the application is alive.
// This can be used by external monitoring services to check the health of the application.
// Like https://healthchecks.io/

export default function (url = null, interval = null) {
  const pingUrl = url || process.env.HEALTH_CHECK_URL;
  const pingSeconds = interval || process.env.HEALTH_CHECK_INTERVAL || 60;

  function ping() {
    fetch(pingUrl).catch(error => {
      console.error('Health check failed:', error);
    });
  }

  if (pingUrl && pingSeconds) {
    console.log(
      `Health check configured: ${pingUrl} every ${pingSeconds} seconds`
    );
    ping();
    setInterval(ping, pingSeconds * 1000);
  } else {
    console.warn('Health check is not configured');
  }
}
