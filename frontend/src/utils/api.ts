import supabase from "../utils/supabase";
import axios from "axios"

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";

const currentBadges = async (userId: string): Promise<number[]> => {
  // First fetch the badges IDs from user_badges for this user
  const { data: userBadgesData, error: userBadgesError } = await supabase
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", userId);

  if (userBadgesError) {
    console.error("Error fetching user badges:", userBadgesError.message);
    return[];
  }

  if (!userBadgesData || userBadgesData.length === 0) {
    return[]; // No badges found
  }

  return userBadgesData.map(badge => badge.badge_id);
}

const checkHowLongMember = async (id:string, whenCreated:string) => {

  // Extract badge IDs
  const badgeIds = await currentBadges(id);

  const givenDate = new Date(whenCreated);
  const currentDate = new Date();

  const differenceInMonths = (currentDate.getMonth() + 1) - (givenDate.getMonth() + 1);
  const differenceInYear = (currentDate.getFullYear()) - (givenDate.getFullYear());

  let gotBadge = "";


  if (differenceInMonths >= 1 && differenceInYear == 0 && !badgeIds.includes(5)){
    const { error } = await supabase
    .from("user_badges")
    .insert({ user_id: id, badge_id: 5 });

    if (error) {
        console.error("Error inserting badge for user:", error.message);
        return;
    } else {
        gotBadge = "Happy 1 month on the site! You just unlocked the 1 month badge";
    }

  } else if (differenceInMonths >= 2 && differenceInYear == 0 && !badgeIds.includes(6)){
    const { error } = await supabase
    .from("user_badges")
    .insert({ user_id: id, badge_id: 6 });

    if (error) {
        console.error("Error inserting badge for user:", error.message);
        return;
    } else {
        gotBadge = "Happy 2 months on the site! You just unlocked the 2 months badge";
    }
  }

  return gotBadge;
}

/**
 * Call api from the backend to extract the text from the object
 * 
 * @param imageBase64 takes the base64 of the image the user has uploaded
 * @returns the text from that image
 */

const ExtractTextFromImage = async (imageBase64: string, manufacture:string ) => {
  try {
    const response = await axios.post(`${apiBase}/api/image-processing/ocr`, {
      imageBase64,
      manufacture
    });

    return response.data.text;
  } catch (error) {
    console.error("Error fetching OCR results:", error);
    return "OCR failed";
  }
};

export {currentBadges, checkHowLongMember, ExtractTextFromImage};