export default async function handler(req, res) {
  const username = req.query.username;
  const bearer = process.env.X_BEARER_TOKEN;

  try {
    const userRes = await fetch(
      `https://api.twitter.com/2/users/by/username/${username}`,
      { headers: { Authorization: `Bearer ${bearer}` } }
    );

    const userData = await userRes.json();

    if (!userData.data) {
      return res.status(400).json({ error: "User not found" });
    }

    const userId = userData.data.id;

    const tweetsRes = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets?max_results=50&tweet.fields=public_metrics`,
      { headers: { Authorization: `Bearer ${bearer}` } }
    );

    const tweets = await tweetsRes.json();

    let perleMentions = 0;
    let totalEngagement = 0;

    tweets.data.forEach(tweet => {
      if (tweet.text.includes("@PerleLabs")) {
        perleMentions++;
        totalEngagement +=
          tweet.public_metrics.like_count +
          tweet.public_metrics.retweet_count;
      }
    });

    res.status(200).json({
      username,
      perleMentions,
      totalEngagement
    });

  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
}
