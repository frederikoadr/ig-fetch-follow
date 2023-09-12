// modified version to search common follower and following from username1 and username2
const username1 = "USERNAME1_HERE";
const username2 = "USERNAME2_HERE";

let followers1 = [];
let followers2 = [];
let followings1 = [];
let followings2 = [];
let commonFollowers = [];
let commonFollowings = [];

(async () => {
  try {
    console.log(`Process started! Give it a couple of seconds`);

    // Fetch followers and followings for username1
    const userId1 = await getUserId(username1);
    followers1 = await getFollowers(userId1);
    followings1 = await getFollowings(userId1);

    // Fetch followers and followings for username2
    const userId2 = await getUserId(username2);
    followers2 = await getFollowers(userId2);
    followings2 = await getFollowings(userId2);

    // Find common followers
    commonFollowers = followers1.filter((follower) =>
      followers2.some((follower2) => follower.username === follower2.username)
    );

    // Find common followings
    commonFollowings = followings1.filter((following) =>
      followings2.some(
        (following2) => following.username === following2.username
      )
    );

    console.log("Common Followers:");
    console.log({ commonFollowers });

    console.log("Common Followings:");
    console.log({ commonFollowings });

    console.log(
      `Process is done: Type 'copy(commonFollowers)' or 'copy(commonFollowings)' in the console to copy the common followers or common followings list.`
    );
  } catch (err) {
    console.error({ err });
  }
})();

async function getUserId(username) {
  const userQueryRes = await fetch(
    `https://www.instagram.com/web/search/topsearch/?query=${username}`
  );
  const userQueryJson = await userQueryRes.json();
  return userQueryJson.users[0].user.pk;
}

async function getFollowers(userId) {
  let followers = [];
  let after = null;
  let has_next = true;

  while (has_next) {
    await fetch(
      `https://www.instagram.com/graphql/query/?query_hash=c76146de99bb02f6415203be841dd25a&variables=` +
        encodeURIComponent(
          JSON.stringify({
            id: userId,
            include_reel: true,
            fetch_mutual: true,
            first: 50,
            after: after,
          })
        )
    )
      .then((res) => res.json())
      .then((res) => {
        has_next = res.data.user.edge_followed_by.page_info.has_next_page;
        after = res.data.user.edge_followed_by.page_info.end_cursor;
        followers = followers.concat(
          res.data.user.edge_followed_by.edges.map(({ node }) => {
            return {
              username: node.username,
              full_name: node.full_name,
            };
          })
        );
      });
  }

  return followers;
}

async function getFollowings(userId) {
  let followings = [];
  let after = null;
  let has_next = true;

  while (has_next) {
    await fetch(
      `https://www.instagram.com/graphql/query/?query_hash=d04b0a864b4b54837c0d870b0e77e076&variables=` +
        encodeURIComponent(
          JSON.stringify({
            id: userId,
            include_reel: true,
            fetch_mutual: true,
            first: 50,
            after: after,
          })
        )
    )
      .then((res) => res.json())
      .then((res) => {
        has_next = res.data.user.edge_follow.page_info.has_next_page;
        after = res.data.user.edge_follow.page_info.end_cursor;
        followings = followings.concat(
          res.data.user.edge_follow.edges.map(({ node }) => {
            return {
              username: node.username,
              full_name: node.full_name,
            };
          })
        );
      });
  }

  return followings;
}
