export const DEFAULT_READING_PASSAGES = [
  {
    id: "sample-reading-1",
    title: "Reading Passage 1: Why are Humboldt squid thriving?",
    instructions: "Read the text and answer questions 1-16.",
    text: "Although many of the Pacific Ocean's big species are endangered, one large creature of the deep seems to be flourishing. The Humboldt squid (Dosidicus gigas), also known as jumbo squid owing to its size, has been steadily expanding its population and range. A few years ago, sightings north of San Diego in California were rare, but the squid is now found as far north as Alaska. Many researchers attribute the squid's recent success to the changes in climate, currents and oxygen-levels that have been adversely affecting populations of other marine species along the western side of North America.\n\nHumboldt squid are remarkably adaptable creatures, able to explore and take advantage of a range of new and altered environments. Although they have been observed in increasing numbers close to the shore, little is known about the lives of these creatures of the deep. Marine biologists wanting to discover more about their movements have started tagging Humboldt squid, and their findings have come as something of a surprise. One squid tagged in Monterey Bay, California was detected 17 days later off the coast of Mexico, having traveled a distance of around 3500km.\n\nHumboldt squid are formidable predators and they appear to have a nearly endless appetite, which sustains an incredible growth rate. Their life span is thought to be between one and two years: they begin by emerging from an egg measuring about 1mm long, and over their short lifetime can reach a length of about two meters and a weight of up to 50 kilograms.\n\nThey seem to be able to feed on anything in the ocean, and researchers have found a range of prey in their stomachs, from tiny krill to 40cm-long hake and even Humboldt remains. If their migration patterns change, a growing mass of these hungry squid could seriously affect local ecosystems and impact fish stocks, especially those that are already threatened, such as hake. Off the west coast of Chile in South America, where the Humboldt squid has been prevalent for much longer than in North America, there is evidence that squid expansion has had a huge impact on hake populations. As the squid migration pattern is similar to that of the hake, hake could soon be affected all along the western coast. Hake populations are monitored by researchers using hydroacoustic instruments, which use sound waves to detect and measure marine life. However, this exercise is being hampered by the presence of squid. Humboldt are often found in and around large concentrations of hake and have a very similar sound 'signature' to the fish, meaning the information that researchers are gathering is frequently unusable.\n\nOne factor contributing to the squid's expansion seems to be the eastern Pacific's growing 'dead zones', areas of the ocean which have particularly low oxygen levels. There are two types of dead zones: man-made and naturally occurring. The first is typically found at the mouths of rivers, where the rapid spread of algae occurs as a result of pollution from farm waste. An example of this is the low-oxygen zone found in the Gulf of Mexico. By contrast, naturally occurring low-oxygen zones are integral parts of larger oceanic systems, where organic matter filters down and is consumed by anaerobic bacteria deep in the ocean.\n\nChanges in climate, wind patterns and currents in the Pacific might all be playing a role in expanding these dead zones, and these are likely to be boosting Humboldt squid numbers. In warmer water areas, low-oxygen zones often start 200 meters down and extend further to about 1,000 meters. Off the coast of California, however, low-oxygen zones have historically started at a depth of around 450 meters, making them much smaller. However, in recent years, these zones have been expanding and low-oxygen areas have been getting closer to the surface in these waters.\n\nThis change has meant fewer liveable ocean habitats for many creatures which depend on well-oxygenated water to survive. But for Humboldt squid, the expansion of dead zones has opened up new territories. Researchers have discovered the squid can stay for a whole day hundreds of meters down in zones holding as little as 10 percent of standard surface oxygen levels. In fact, the squid do not just seem to tolerate these harsh environments, but they appear to actually favor them.\n\nJust how Humboldt squid can survive deep in these low-oxygen zones remains a mystery. In such environments, oxygen levels are so low that large predatory fish are unable to stay there for long. This means that the Humboldt squid have no competition when feeding on small animals such as krill, which can be found in large numbers deep down in low-oxygen water.",
    questions: [
      {
        id: "sample-q1",
        number: 1,
        type: "true_false_not_given",
        prompt:
          "The areas where Humboldt squid can be found have rapidly increased over recent years.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        correctAnswers: ["TRUE"],
      },
      {
        id: "sample-q2",
        number: 2,
        type: "true_false_not_given",
        prompt:
          "Some scientists believe that climate change has had a negative impact on the Humboldt squid population.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        correctAnswers: ["FALSE"],
      },
      {
        id: "sample-q3",
        number: 3,
        type: "true_false_not_given",
        prompt:
          "Marine biologists have found it easier to learn about the habits of the squid populations which live closer to land.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        correctAnswers: ["NOT GIVEN"],
      },
      {
        id: "sample-q4",
        number: 4,
        type: "true_false_not_given",
        prompt:
          "Researchers predicted that a Humboldt squid tagged in Monterey Bay would take 17 days to reach the coast of Mexico.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        correctAnswers: ["FALSE"],
      },
      {
        id: "sample-q5",
        number: 5,
        type: "true_false_not_given",
        prompt:
          "The Humboldt squid has one of the highest rates of success compared with other squid when hunting for food.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        correctAnswers: ["NOT GIVEN"],
      },
      {
        id: "sample-q6",
        number: 6,
        type: "true_false_not_given",
        prompt:
          "There is evidence that Humboldt squid eat others of their own species.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        correctAnswers: ["TRUE"],
      },
      {
        id: "sample-q7",
        number: 7,
        type: "true_false_not_given",
        prompt:
          "The growth of Humboldt squid populations has had a minimal effect on South American hake stocks.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        correctAnswers: ["FALSE"],
      },
      {
        id: "sample-q8",
        number: 8,
        type: "true_false_not_given",
        prompt:
          "Scientists are often unable to use the data which they have collected about South American hake populations.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        correctAnswers: ["TRUE"],
      },
      {
        id: "sample-q9",
        number: 9,
        type: "note_completion",
        prompt: "often present where ______ meet the ocean",
        correctAnswers: ["rivers"],
      },
      {
        id: "sample-q10",
        number: 10,
        type: "note_completion",
        prompt: "agricultural waste causes ______ to grow",
        correctAnswers: ["algae"],
      },
      {
        id: "sample-q11",
        number: 11,
        type: "note_completion",
        prompt: "formed by ______ feeding on organic material at lower depths",
        correctAnswers: ["bacteria"],
      },
      {
        id: "sample-q12",
        number: 12,
        type: "note_completion",
        prompt:
          "expanding due to global warming and alterations in the movement of ______ and water",
        correctAnswers: ["wind"],
      },
      {
        id: "sample-q13",
        number: 13,
        type: "note_completion",
        prompt:
          "now occurring nearer to the ______ off the coast of California",
        correctAnswers: ["surface"],
      },
      {
        id: "sample-q14",
        number: 14,
        type: "note_completion",
        prompt: "survive in areas with oxygen levels as low as ______",
        correctAnswers: ["10%", "10 percent"],
      },
      {
        id: "sample-q15",
        number: 15,
        type: "note_completion",
        prompt: "benefit from a lack of ______ from other predators",
        correctAnswers: ["competition"],
      },
      {
        id: "sample-q16",
        number: 16,
        type: "note_completion",
        prompt: "find plenty of food e.g. in the form of ______ in dead zones",
        correctAnswers: ["krill"],
      },
    ],
    timeLimitMinutes: 20,
    createdAt: 1710000000000,
  },
];
