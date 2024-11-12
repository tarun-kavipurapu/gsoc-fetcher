import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

const requests = [];
async function fetchGsoc() {
  for (let i = 0; i <= 8; i++) {
    let config;
    if (i == 8) {
      config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `https://summerofcode.withgoogle.com/api/program/2024/organizations/`,
        headers: {},
      };
    } else {
      config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `https://summerofcode.withgoogle.com/api/archive/programs/${
          2016 + i
        }/organizations/`,
        headers: {},
      };
    }

    requests.push(
      axios
        .request(config)
        .then((response) => ({ year: 2016 + i, data: response.data }))
    );
  }

  try {
    const responses = await Promise.all(requests);
    console.log();
    for (let i = 0; i <= 8; i++) {
      const responseObject = responses[i].data;
      for (const item of responseObject) {
        const name = item.name;
        const website_url = item.website_url;
        let year = item.program_slug;
        if (i == 8) {
          year = "2024";
        }
        const progLangs = item.tech_tags;
        // const existedOrg = await prisma.organization.findUnique({
        //   where: { name },
        // });
        //   console.log(existedOrg);

        await prisma.organization.upsert({
          where: { name },
          update: { years: { push: Number(year) } },
          create: {
            name,
            years: [Number(year)],
            websiteUrl: website_url,
            progLanguage: progLangs,
          },
        });
      }
      console.log("Data has been successfully processed and saved.");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
  //check if data.name is in  prisma.model.Organization if so just insert the 2016+i into the years if it is not ther just insert
}
fetchGsoc();

// async function deleteAllRows() {
//   try {
//     await prisma.organization.deleteMany(); // Deletes all rows in the Organization model
//     console.log("All rows deleted successfully.");
//   } catch (error) {
//     console.error("Error deleting rows:", error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }
// deleteAllRows();

// async function resetAutoIncrement() {
//   await prisma.$executeRaw`ALTER SEQUENCE "Organization_id_seq" RESTART WITH 1;
// `;
//   // or for MySQL
//   // await prisma.$executeRaw`ALTER TABLE your_table_name AUTO_INCREMENT = 1;`;
// }

// resetAutoIncrement()
//   .catch((e) => console.error(e))
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

// resetAutoIncrement();
