import SysConf from "../../../conf/config.js";
import ImageMatcher from "../ImageMatcher.js";

const Config = new SysConf().MustLoad();

async function ImageProcessor(UserID, Bucket, ObjectKey, DbConnection) {
  console.log(
    `Processing image for UserID: ${UserID}, Bucket: ${Bucket}, ObjectKey: ${ObjectKey}`,
  );
  const userDetails = await DbConnection.findUserById(UserID);
  if (!userDetails) {
    console.error(`User with ID ${UserID} not found.`);
    return;
  }

  const punchLocation = { bucket: Bucket, key: ObjectKey };
  if (!punchLocation.bucket || !punchLocation.key) {
    console.error("Invalid punch photo location, skipping face match");
    return {
      matchResult: {
        match: false,
        similarity: null,
        reason: "invalid punch photo location",
      },
    };
  }

  const profileImageUrl = userDetails.profileImage || userDetails.profilePhoto;
  if (!profileImageUrl) {
    console.warn(`No profile image found for user ${UserID}`);
    return {
      matchResult: {
        match: false,
        similarity: null,
        reason: "missing profile image",
      },
    };
  }

  const matchResult = await ImageMatcher(UserID, punchLocation);

  return { matchResult };
}

export default ImageProcessor;
