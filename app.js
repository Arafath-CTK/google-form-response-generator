import fetch from "node-fetch";
import { load } from "cheerio";
import { run } from "node:test";

//sanas
const FORM_ID = "1FAIpQLSdUd7P4R5GdDLkuaj2XWvZsDYSht1AiFC3fsuY7N9E6c2Ea1g";

// const FORM_ID = "1FAIpQLSf-Uw8wigQ9I_iFtiAPIHjTCsFncZD6RXqfXS5OTUYxEIwZuw";
// const FORM_ID = "1FAIpQLSdiTHZ_dL8J6OXzD16OZ7lsbhVfPnnq7AJjJYgMXHdgdUVj3A";

const FORM_VIEW = `https://docs.google.com/forms/d/e/${FORM_ID}/viewform`;
const FORM_POST = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`;

// Sanas
const TOTAL_PAGES = 6;
// const TOTAL_PAGES = 2;

// Delay between submissions (in milliseconds)
// const MIN_DELAY_MS = 500;
// const MAX_DELAY_MS = 1000;

// Delay between submissions (in minutes)
const MIN_DELAY_MIN = 1;
const MAX_DELAY_MIN = 15;

const presets = {
  agree: ["3", "4", "5"],
  neutral: ["2", "3", "4"],
  disagree: ["1", "2", "3"],
  random: ["1", "2", "3", "4", "5"],
};

const presetGroups = {
  agree: [1, 3, 4, 9, 10, 11, 46, 50, 53, 54],
  neutral: [
    2, 5, 6, 7, 8, 12, 13, 15, 16, 19, 20, 22, 30, 31, 35, 36, 40, 41, 44, 47,
    57, 58,
  ],
  disagree: [17, 23, 26, 27, 28, 32, 39, 42],
  random: [
    14, 18, 21, 24, 25, 29, 33, 34, 37, 38, 43, 45, 48, 49, 51, 52, 55, 56,
  ],
};

// const presetGroups = {
//   agree: [2],
//   random: [1, 3, 4],
// };

// const sampleData = {
//   ...Object.fromEntries(
//     Object.entries(presetGroups)
//       .flatMap(([preset, questions]) =>
//         questions.map((q) => [`q${q}`, presets[preset]])
//       )
//       .sort((a, b) => {
//         const n1 = parseInt(a[0].substring(1));
//         const n2 = parseInt(b[0].substring(1));
//         return n1 - n2;
//       })
//   ),
// };

const sampleData = {
  q1: [
    // "21-25",
    "26-35",
    "36-45",
    "46 or above",
  ],
  q2: ["Male", "Female"],
  q3: [
    "Higher Secondary or Below",
    "Diploma",
    "Undergraduate Degree",
    "Postgraduate Degree",
    // "PhD",
  ],
  q4: [
    // "Less than 1 year",
    "1–3 years",
    "4–6 years",
    "7–10 years",
    "More than 10 years",
  ],

  ...Object.fromEntries(
    Object.entries(presetGroups)
      .flatMap(([preset, questions]) =>
        questions.map((q) => [`q${q + 4}`, presets[preset]])
      )
      .sort((a, b) => {
        const n1 = parseInt(a[0].substring(1));
        const n2 = parseInt(b[0].substring(1));
        return n1 - n2;
      })
  ),
};

const fields = {
  q1: "entry.955922717",
  q2: "entry.722399654",
  q3: "entry.594324506",
  q4: "entry.1101005731",
  q5: "entry.78735435",
  q6: "entry.595123630",
  q7: "entry.1889938907",
  q8: "entry.660292076",
  q9: "entry.484913448",
  q10: "entry.1724093769",
  q11: "entry.2058711897",
  q12: "entry.658631506",
  q13: "entry.1887871754",
  q14: "entry.849270714",
  q15: "entry.700386851",
  q16: "entry.677749747",
  q17: "entry.662530754",
  q18: "entry.113494091",
  q19: "entry.937347898",
  q20: "entry.1392523288",
  q21: "entry.1184574188",
  q22: "entry.641959030",
  q23: "entry.140023580",
  q24: "entry.1510027621",
  q25: "entry.450511428",
  q26: "entry.819610506",
  q27: "entry.310286663",
  q28: "entry.398910170",
  q29: "entry.1899887727",
  q30: "entry.1965353490",
  q31: "entry.1024282938",
  q32: "entry.1631279455",
  q33: "entry.1015017900",
  q34: "entry.1506858584",
  q35: "entry.1845880694",
  q36: "entry.1798151258",
  q37: "entry.1364748886",
  q38: "entry.1576892622",
  q39: "entry.121866710",
  q40: "entry.57699068",
  q41: "entry.2047676606",
  q42: "entry.485780771",
  q43: "entry.1746656700",
  q44: "entry.73265585",
  q45: "entry.1449285437",
  q46: "entry.1845248323",
  q47: "entry.1309108289",
  q48: "entry.1322619868",
  q49: "entry.1286851023",
  q50: "entry.1365256087",
  q51: "entry.249677574",
  q52: "entry.1861269740",
  q53: "entry.1862705581",
  q54: "entry.11795281",
  q55: "entry.1359796713",
  q56: "entry.417528697",
  q57: "entry.2028261694",
  q58: "entry.248774854",
  q59: "entry.1946673067",
  q60: "entry.98322999",
  q61: "entry.1242798323",
  q62: "entry.984691265",
};

// const fields = {
//   q1: "entry.843013427",
//   q2: "entry.1825863347",
//   q3: "entry.532657592",
//   q4: "entry.413881059",
// };

let count = 0;
const runBatch = async (BATCH_COUNT) => {
  while (count < BATCH_COUNT) {
    // 1) Fetch fresh form tokens
    const viewRes = await fetch(FORM_VIEW, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const html = await viewRes.text();
    const $ = load(html);
    const fbzx = $('input[name="fbzx"]').attr("value");
    const fvv = $('input[name="fvv"]').attr("value");
    const draftResponse = `[, ,"${fbzx}"]`;

    // 2) Build complete pageHistory
    const pageHistory = Array.from(
      { length: TOTAL_PAGES },
      (_, idx) => idx
    ).join(",");

    // 3) Generate random answers and assemble POST body
    const body = new URLSearchParams();
    for (const [qKey, entryId] of Object.entries(fields)) {
      const opts = sampleData[qKey];
      if (opts) {
        body.append(entryId, opts[Math.floor(Math.random() * opts.length)]);
      }
    }
    body.append("fbzx", fbzx);
    body.append("fvv", fvv);
    body.append("pageHistory", pageHistory);
    body.append("draftResponse", draftResponse);

    // 4) Submit the form response
    const postRes = await fetch(FORM_POST, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: FORM_VIEW,
        "User-Agent": "Mozilla/5.0",
      },
      body,
    });

    count++;
    console.log(
      postRes.ok
        ? `Submitted response #${count}`
        : `Submission #${count} failed: ${postRes.status}`
    );

    if (count < BATCH_COUNT) {
      // 5) Wait a randomized delay before next iteration
      // -- Milliseconds:
      // const delayMs =
      //   MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
      // console.log(`Waiting ${Math.round(delayMs)}ms before next submission…`);
      // await new Promise((r) => setTimeout(r, delayMs));

      // -- Minutes:
      const delayMin =
        MIN_DELAY_MIN + Math.random() * (MAX_DELAY_MIN - MIN_DELAY_MIN);
      const delayMs = delayMin * 60 * 1000;
      console.log(
        `Waiting ${delayMin.toFixed(2)} minutes before next submission…`
      );
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  console.log(`✅ Done! Sent ${count} responses.`);
};

runBatch(5);
