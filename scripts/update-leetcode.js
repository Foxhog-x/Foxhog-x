const fs = require("fs");

const username = "onkarpatil_op";

async function fetchLeetCode() {
    const query = `
    query userProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          realName
          ranking
          reputation
        }
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }

      allQuestionsCount {
        difficulty
        count
      }
    }
  `;

    const response = await fetch("https://leetcode.com/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Referer": "https://leetcode.com/",
        },
        body: JSON.stringify({
            query,
            variables: { username },
        }),
    });

    if (!response.ok) {
        throw new Error(`LeetCode request failed: ${response.status}`);
    }

    return response.json();
}

function generateSvg(data) {
    const user = data.data.matchedUser;

    const solved = Object.fromEntries(
        user.submitStatsGlobal.acSubmissionNum.map((item) => [
            item.difficulty,
            item.count,
        ])
    );

    const totalSolved =
        (solved.Easy || 0) +
        (solved.Medium || 0) +
        (solved.Hard || 0);

    return `
<svg width="700" height="220"
     viewBox="0 0 700 220"
     xmlns="http://www.w3.org/2000/svg">

  <rect width="700" height="220" rx="16"
        fill="#0d1117"/>

  <text x="35" y="45"
        fill="#ffffff"
        font-size="24"
        font-family="Arial">
    LeetCode Progress
  </text>

  <text x="35" y="85"
        fill="#8b949e"
        font-size="16"
        font-family="Arial">
    ${username}
  </text>

  <text x="35" y="135"
        fill="#ffffff"
        font-size="32"
        font-weight="bold"
        font-family="Arial">
    ${totalSolved}
  </text>

  <text x="35" y="160"
        fill="#8b949e"
        font-size="14"
        font-family="Arial">
    Problems Solved
  </text>

  <text x="230" y="135"
        fill="#ffffff"
        font-size="24"
        font-family="Arial">
    Easy ${solved.Easy || 0}
  </text>

  <text x="390" y="135"
        fill="#ffffff"
        font-size="24"
        font-family="Arial">
    Medium ${solved.Medium || 0}
  </text>

  <text x="570" y="135"
        fill="#ffffff"
        font-size="24"
        font-family="Arial">
    Hard ${solved.Hard || 0}
  </text>

  <text x="35" y="195"
        fill="#8b949e"
        font-size="13"
        font-family="Arial">
    Automatically updated by GitHub Actions
  </text>

</svg>
`;
}

async function main() {
    const data = await fetchLeetCode();

    fs.mkdirSync("assets", { recursive: true });

    fs.writeFileSync(
        "assets/leetcode.svg",
        generateSvg(data)
    );

    console.log("LeetCode stats updated.");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});