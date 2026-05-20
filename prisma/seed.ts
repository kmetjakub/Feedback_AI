import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.feedback.createMany({
    data: [
      {
        name: "Alice Chen",
        email: "alice@example.com",
        category: "Bug",
        text: "The export button doesn't work on Safari. Clicking it does nothing — no download, no error message.",
      },
      {
        name: "Marcus Rivera",
        email: "marcus@acme.io",
        category: "Feature request",
        text: "Would love the ability to tag feedback with custom labels so I can organize responses by sprint or team.",
      },
      {
        name: "Sophie Williams",
        category: "Compliment",
        text: "This tool saved me hours last week. The AI insights are genuinely useful and I shared them directly in my PM meeting.",
      },
      {
        name: "David Park",
        email: "dpark@startup.co",
        category: "Bug",
        text: "When I upload a CSV with more than 200 rows the page freezes for about 30 seconds before showing a result. Needs a progress indicator at minimum.",
      },
      {
        name: "Priya Nair",
        category: "Feature request",
        text: "Please add email notifications so I get alerted whenever new feedback comes in. Right now I have to remember to check the dashboard manually.",
      },
      {
        name: "Tom Brennan",
        email: "tom@brennandesign.com",
        category: "General",
        text: "Using this for a client project. Would be great to have a way to white-label the feedback form with a custom logo and brand colors.",
      },
      {
        name: "Yuki Tanaka",
        email: "yuki.t@corp.jp",
        category: "Compliment",
        text: "The category badges make it incredibly easy to triage at a glance. Really thoughtful UX decision.",
      },
      {
        name: "Omar Khalil",
        category: "Bug",
        text: "On mobile the feedback textarea is too small and the submit button overlaps with the keyboard. Hard to use on iPhone 13.",
      },
      {
        name: "Laura Martínez",
        email: "laura@product.es",
        category: "Feature request",
        text: "It would be really powerful to schedule AI insight reports weekly and receive them by email. That way I never miss a trend.",
      },
      {
        name: "James O'Brien",
        email: "james@techcorp.ie",
        category: "General",
        text: "Tried it for a product beta last week. Got 47 responses and the AI summary captured the mood accurately. Will use again for next launch.",
      },
    ],
  });

  console.log("Seeded 10 feedback entries.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
