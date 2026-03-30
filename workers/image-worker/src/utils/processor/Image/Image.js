import SysConf from "../../../conf/config.js";
import ImageMatcher from "../ImageMatcher.js";

const Config = new SysConf().MustLoad();

function parseS3Location(value) {
  if (!value) return null;

  try {
    const url = new URL(value);
    const hostParts = url.hostname.split(".");
    const pathParts = url.pathname.split("/").filter(Boolean);
    let bucket = Config.AWS_PROFILE_PHOTO_BUCKET;
    console.log("profile image:"+bucket);
    let key = pathParts.join("/");

    if (hostParts.length >= 3 && hostParts[1] === "s3") {
      bucket = hostParts[0];
    } else if (hostParts[0] === "s3") {
      bucket = pathParts.shift();
      key = pathParts.join("/");
    }

    if (!bucket || !key) {
      return null;
    }

    return { bucket, key };
  } catch {
    if (!Config.AWS_PROFILE_PHOTO_BUCKET) return null;
    return { bucket: Config.AWS_PROFILE_PHOTO_BUCKET, key: value };
  }
}

async function ImageProcessor(UserID, Bucket, ObjectKey, DbConnection) {
  console.log(
    `Processing image for UserID: ${UserID}, Bucket: ${Bucket}, ObjectKey: ${ObjectKey}`,
  );
  const userDetails = await DbConnection.findUserById(UserID);
  if (!userDetails) {
    console.error(`User with ID ${UserID} not found.`);
    return;
  }

  const profileLocation = parseS3Location(userDetails.profilePhoto);
  if (!profileLocation?.bucket || !profileLocation?.key) {
    console.warn(`No valid profile photo found for user ${UserID}`);
    return {
      matchResult: {
        match: false,
        similarity: null,
        reason: "missing profile photo",
      },
    };
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

  const matchResult = await ImageMatcher(profileLocation, punchLocation);

  return { matchResult };
}

export default ImageProcessor;
