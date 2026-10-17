// Kör alla tester i svensk tid, så att tidszonsfel (A15) syns oavsett var testerna körs.
module.exports = async () => {
  process.env.TZ = "Europe/Stockholm";
};
