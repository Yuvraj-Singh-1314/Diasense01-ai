type HealthContext = {
  risk?: number;
  category?: string;
  bmi?: number;
  healthScore?: number;
  diet?: string;
  exercise?: string;
  lifestyle?: string;
};

type HealthResponse = {
  answer: string;
  emergency: boolean;
  topic: string;
};

const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s%.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const isHinglish = (text: string) =>
  /\b(kya|kaise|mujhe|mera|meri|aap|tum|batao|samjhao|karu|karna|chahiye|nahi|hai|hain|aur|ke|ki|kab|kyun|kyunki|ho|hota|hoti|raha|rahi)\b/i.test(
    text,
  );

const emergencyKeywords = [
  "chest pain",
  "severe chest pain",
  "difficulty breathing",
  "can't breathe",
  "cannot breathe",
  "breathing problem",
  "shortness of breath",
  "fainting",
  "passed out",
  "unconscious",
  "stroke",
  "face drooping",
  "slurred speech",
  "seizure",
  "heavy bleeding",
  "severe bleeding",
  "severe allergic reaction",
  "anaphylaxis",
  "suicidal",
  "suicide",
  "self harm",
  "kill myself",
  "बेहोश",
  "सीने में तेज दर्द",
  "सांस लेने में दिक्कत",
];

const containsAny = (
  text: string,
  words: string[],
) => words.some((word) => text.includes(word));

function emergencyResponse(
  hinglish: boolean,
): HealthResponse {
  if (hinglish) {
    return {
      topic: "emergency",
      emergency: true,
      answer:
        "- Yeh symptoms emergency ho sakte hain.\n" +
        "- Abhi nearest emergency department/hospital ya local emergency service se contact karein.\n" +
        "- Agar chest pain, severe breathing difficulty, stroke ke signs, behoshi, seizure ya severe bleeding ho rahi hai to delay na karein.\n" +
        "- Khud se diagnosis ya treatment karne ki koshish na karein.",
    };
  }

  return {
    topic: "emergency",
    emergency: true,
    answer:
      "- These symptoms may require urgent medical attention.\n" +
      "- Contact your local emergency service or go to the nearest emergency department now.\n" +
      "- Do not delay if there is chest pain, severe breathing difficulty, signs of stroke, fainting, seizure, or severe bleeding.\n" +
      "- Do not try to diagnose or treat a potentially serious emergency yourself.",
  };
}

function diabetesResponse(
  hinglish: boolean,
  context: HealthContext,
): string {
  const risk =
    context.risk !== undefined
      ? `${context.risk}%`
      : "not available";

  const bmi =
    context.bmi !== undefined
      ? context.bmi.toFixed(1)
      : "not available";

  if (hinglish) {
    return (
      `- Diabetes blood glucose ko control karne ki body ki ability se related condition hai.\n` +
      `- Aapke latest DiaSense risk estimate ke according risk ${risk} hai aur BMI ${bmi} hai.\n` +
      `- Risk estimate diagnosis nahi hota; proper diagnosis ke liye healthcare professional aur appropriate blood tests ki zarurat hoti hai.\n` +
      `- Balanced diet, regular physical activity, healthy weight, adequate sleep aur regular monitoring important hote hain.\n` +
      `- Agar aap apna glucose/HbA1c result share karna chahte hain to main uska general meaning explain kar sakta hoon.`
    );
  }

  return (
    `- Diabetes is a condition involving how the body regulates blood glucose.\n` +
    `- Your latest DiaSense risk estimate is ${risk}, with a BMI of ${bmi}.\n` +
    `- A risk estimate is not a diagnosis; diagnosis requires appropriate clinical evaluation and testing.\n` +
    `- Balanced nutrition, regular physical activity, healthy weight management, adequate sleep, and appropriate monitoring are important.\n` +
    `- If you share a glucose or HbA1c result, I can explain its general meaning.`
  );
}

function bloodPressureResponse(
  hinglish: boolean,
): string {
  if (hinglish) {
    return (
      "- Blood pressure mein do numbers hote hain: systolic aur diastolic.\n" +
      "- Ek single high reading se hamesha hypertension confirm nahi hota; repeated properly measured readings important hain.\n" +
      "- BP measure karte waqt kuch minutes rest karein, feet floor par rakhein aur arm ko supported rakhein.\n" +
      "- Regularly high readings ke liye healthcare professional se evaluation karwana useful hai.\n" +
      "- Bahut high BP ke saath chest pain, severe headache, breathing difficulty, confusion ya neurological symptoms ho to urgent medical care lein."
    );
  }

  return (
    "- Blood pressure has two numbers: systolic and diastolic.\n" +
    "- A single elevated reading does not always establish hypertension; repeated properly measured readings are important.\n" +
    "- Before measuring, rest for several minutes, keep your feet supported, and keep your arm supported.\n" +
    "- Repeatedly elevated readings should be discussed with a healthcare professional.\n" +
    "- Very high blood pressure with chest pain, severe headache, breathing difficulty, confusion, or neurological symptoms needs urgent medical attention."
  );
}

function feverResponse(
  hinglish: boolean,
): string {
  if (hinglish) {
    return (
      "- Fever body temperature ke temporarily increase hone ko kehte hain aur infection ke saath commonly ho sakta hai.\n" +
      "- Rest aur adequate fluids important hain.\n" +
      "- Temperature ko reliable thermometer se monitor karein.\n" +
      "- Persistent, very high, recurrent fever ya severe symptoms ke liye clinician se evaluation karwayein.\n" +
      "- Severe breathing difficulty, confusion, seizure, severe dehydration ya unconsciousness emergency signs ho sakte hain."
    );
  }

  return (
    "- Fever is a temporary rise in body temperature and commonly occurs with infections.\n" +
    "- Rest and adequate fluids are important.\n" +
    "- Monitor temperature with a reliable thermometer.\n" +
    "- Persistent, very high, recurrent fever, or significant associated symptoms should be evaluated by a clinician.\n" +
    "- Severe breathing difficulty, confusion, seizure, severe dehydration, or unconsciousness can be emergency signs."
  );
}

function headacheResponse(
  hinglish: boolean,
): string {
  if (hinglish) {
    return (
      "- Headache ke causes bahut different ho sakte hain, jaise dehydration, lack of sleep, stress, migraine ya viral illness.\n" +
      "- Paani, adequate sleep aur regular meals helpful ho sakte hain.\n" +
      "- Headache ka pattern, duration aur triggers note karna useful hai.\n" +
      "- Sudden extremely severe headache, neurological weakness, confusion, seizure ya head injury ke baad severe headache ho to urgent care lein.\n" +
      "- Frequent ya worsening headaches ke liye clinician se evaluation karwayein."
    );
  }

  return (
    "- Headaches can have many causes, including dehydration, inadequate sleep, stress, migraine, or illness.\n" +
    "- Hydration, adequate sleep, and regular meals may help depending on the cause.\n" +
    "- Track the headache pattern, duration, and possible triggers.\n" +
    "- A sudden extremely severe headache, neurological weakness, confusion, seizure, or severe headache after a head injury needs urgent evaluation.\n" +
    "- Frequent or worsening headaches should be discussed with a clinician."
  );
}

function coughColdResponse(
  hinglish: boolean,
): string {
  if (hinglish) {
    return (
      "- Cough aur cold commonly viral infections ke saath ho sakte hain.\n" +
      "- Rest, fluids aur throat comfort measures symptoms ko manage karne mein help kar sakte hain.\n" +
      "- Antibiotics viral cold ko treat nahi karte jab tak bacterial infection clinically identified na ho.\n" +
      "- Breathing difficulty, chest pain, blue/grey lips, confusion ya severe worsening ho to urgent care lein.\n" +
      "- Persistent ya recurrent cough ke liye healthcare professional se evaluation karwayein."
    );
  }

  return (
    "- Cough and colds commonly occur with viral respiratory infections.\n" +
    "- Rest, fluids, and measures that soothe the throat may help with symptoms.\n" +
    "- Antibiotics do not treat viral colds unless a bacterial infection is identified clinically.\n" +
    "- Breathing difficulty, chest pain, blue/grey lips, confusion, or severe worsening requires urgent evaluation.\n" +
    "- Persistent or recurrent cough should be evaluated by a healthcare professional."
  );
}

function stomachResponse(
  hinglish: boolean,
): string {
  if (hinglish) {
    return (
      "- Stomach problems ke causes food intolerance, infection, reflux, constipation, stress aur other conditions ho sakte hain.\n" +
      "- Hydration aur simple balanced meals helpful ho sakte hain.\n" +
      "- Symptoms ka relation food, bowel movements aur timing ke saath note karein.\n" +
      "- Severe abdominal pain, persistent vomiting, blood in stool/vomit, black stool ya severe dehydration ke liye urgent medical care lein.\n" +
      "- Recurrent symptoms ke liye clinician se evaluation karwayein."
    );
  }

  return (
    "- Digestive symptoms can have many causes, including food intolerance, infection, reflux, constipation, stress, and other conditions.\n" +
    "- Hydration and simple balanced meals may be helpful depending on the symptoms.\n" +
    "- Track the relationship between symptoms, food, bowel movements, and timing.\n" +
    "- Severe abdominal pain, persistent vomiting, blood in vomit/stool, black stool, or severe dehydration requires urgent medical care.\n" +
    "- Recurrent symptoms should be evaluated by a clinician."
  );
}

function nutritionResponse(
  hinglish: boolean,
): string {
  if (hinglish) {
    return (
      "- Healthy diet ka focus overall balanced pattern par hona chahiye.\n" +
      "- Vegetables, fruits, whole grains, pulses/beans, appropriate protein aur healthy fats ko include karein.\n" +
      "- Highly processed foods, excess added sugar aur excessive salt ko limit karna generally useful hai.\n" +
      "- Individual needs age, activity, medical conditions aur medications ke according change hoti hain.\n" +
      "- Agar diabetes, kidney disease, pregnancy ya koi specific condition hai to personalized diet ke liye qualified professional se advice lein."
    );
  }

  return (
    "- A healthy diet is generally about the overall eating pattern rather than one specific food.\n" +
    "- Include vegetables, fruits, whole grains, legumes, appropriate protein, and healthy sources of fat.\n" +
    "- Limiting highly processed foods, excessive added sugar, and excessive salt is generally useful.\n" +
    "- Individual nutrition needs vary with age, activity, medical conditions, and medications.\n" +
    "- Conditions such as diabetes, kidney disease, or pregnancy may require individualized nutrition advice."
  );
}

function exerciseResponse(
  hinglish: boolean,
): string {
  if (hinglish) {
    return (
      "- Regular physical activity overall health, cardiovascular health aur metabolic health ke liye useful hoti hai.\n" +
      "- Walking, cycling, swimming ya strength exercises ko gradually routine mein include kiya ja sakta hai.\n" +
      "- Agar aap currently inactive hain to intensity gradually increase karein.\n" +
      "- Chest pain, severe breathlessness, fainting ya unusual severe symptoms exercise ke during ho to stop karke urgent evaluation lein.\n" +
      "- Existing medical condition ke case mein exercise plan clinician se personalize karwana useful hai."
    );
  }

  return (
    "- Regular physical activity supports cardiovascular, metabolic, and overall health.\n" +
    "- Walking, cycling, swimming, and strength exercises can be incorporated gradually.\n" +
    "- If you are currently inactive, increase intensity progressively.\n" +
    "- Stop exercise and seek urgent evaluation for chest pain, severe breathlessness, fainting, or unusual severe symptoms.\n" +
    "- If you have a medical condition, an individualized exercise plan may be appropriate."
  );
}

function sleepResponse(
  hinglish: boolean,
): string {
  if (hinglish) {
    return (
      "- Consistent sleep schedule aur adequate sleep overall health ke liye important hain.\n" +
      "- Daily same time ke around sleep/wake karne ki koshish karein.\n" +
      "- Bedtime se pehle caffeine, heavy meals aur excessive screen exposure limit karna helpful ho sakta hai.\n" +
      "- Loud snoring, witnessed breathing pauses, excessive daytime sleepiness ya persistent insomnia ho to clinician se baat karein.\n" +
      "- Sleep problems persistent hain to unka cause evaluate karna important hai."
    );
  }

  return (
    "- A consistent sleep schedule and adequate sleep are important for overall health.\n" +
    "- Try to keep sleep and wake times reasonably consistent.\n" +
    "- Limiting caffeine late in the day, heavy meals close to bedtime, and excessive screen exposure may help.\n" +
    "- Loud snoring, witnessed breathing pauses, excessive daytime sleepiness, or persistent insomnia should be discussed with a clinician.\n" +
    "- Persistent sleep problems deserve evaluation for an underlying cause."
  );
}

function weightResponse(
  hinglish: boolean,
): string {
  if (hinglish) {
    return (
      "- Healthy weight management usually gradual aur sustainable changes par depend karta hai.\n" +
      "- Balanced meals, regular activity, adequate sleep aur realistic goals important hain.\n" +
      "- Crash diets ya extreme restriction sustainable nahi hote aur kuch logon ke liye harmful ho sakte hain.\n" +
      "- Aapka BMI ek screening measure hai, complete picture nahi.\n" +
      "- Rapid unexplained weight loss/gain ke liye clinician se evaluation karwayein."
    );
  }

  return (
    "- Healthy weight management generally depends on gradual, sustainable changes.\n" +
    "- Balanced meals, regular activity, adequate sleep, and realistic goals are useful foundations.\n" +
    "- Crash diets and extreme restriction may be unsustainable and can be harmful for some people.\n" +
    "- BMI is a screening measure and does not describe overall health by itself.\n" +
    "- Rapid unexplained weight loss or gain should be evaluated by a clinician."
  );
}

function vitaminsResponse(
  hinglish: boolean,
): string {
  if (hinglish) {
    return (
      "- Vitamins aur minerals body ke different functions ke liye important hain.\n" +
      "- Supplements har person ko automatically required nahi hote.\n" +
      "- Deficiency confirm karne ke liye symptoms ke saath appropriate medical evaluation/testing useful ho sakti hai.\n" +
      "- High-dose supplements kuch cases mein harmful ho sakte hain aur medicines ke saath interact kar sakte hain.\n" +
      "- Supplement start karne se pehle qualified healthcare professional se discuss karna better hai."
    );
  }

  return (
    "- Vitamins and minerals support many functions in the body.\n" +
    "- Supplements are not automatically necessary for everyone.\n" +
    "- If deficiency is suspected, appropriate clinical evaluation and testing may be useful.\n" +
    "- High-dose supplements can be harmful in some situations and may interact with medicines.\n" +
    "- Discuss supplements with a qualified healthcare professional when appropriate."
  );
}

function medicineResponse(
  hinglish: boolean,
): string {
  if (hinglish) {
    return (
      "- Medicines ke uses, side effects aur interactions medicine-specific hote hain.\n" +
      "- Apni prescribed medicine ko bina clinician ki advice ke start/stop/change na karein.\n" +
      "- Medicine ka exact naam aur strength batayenge to main uska general educational information explain kar sakta hoon.\n" +
      "- Severe allergic reaction, breathing difficulty, fainting ya serious reaction ke signs mein urgent medical care lein."
    );
  }

  return (
    "- Medication uses, side effects, and interactions are specific to the medicine.\n" +
    "- Do not start, stop, or change a prescribed medicine without appropriate clinical advice.\n" +
    "- If you provide the exact medicine name and strength, I can explain general educational information about it.\n" +
    "- Severe allergic reactions, breathing difficulty, fainting, or other serious reactions require urgent medical care."
  );
}

function skinResponse(
  hinglish: boolean,
): string {
  if (hinglish) {
    return (
      "- Skin problems ke causes allergy, irritation, infection, dryness aur many other conditions ho sakte hain.\n" +
      "- New products ya irritants se relation note karein.\n" +
      "- Skin ko gently clean aur moisturized rakhna useful ho sakta hai.\n" +
      "- Rapidly spreading rash, severe swelling, breathing difficulty ya facial/tongue swelling emergency ho sakti hai.\n" +
      "- Persistent, painful ya worsening skin problem ke liye clinician/dermatologist se evaluation karwayein."
    );
  }

  return (
    "- Skin problems can have many causes, including allergy, irritation, infection, dryness, and other conditions.\n" +
    "- Note whether symptoms started after a new product, medicine, food, or other exposure.\n" +
    "- Gentle cleansing and appropriate moisturization may help some conditions.\n" +
    "- A rapidly spreading rash, severe swelling, breathing difficulty, or facial/tongue swelling can be an emergency.\n" +
    "- Persistent, painful, or worsening skin problems should be evaluated by a clinician."
  );
}

function mentalHealthResponse(
  hinglish: boolean,
): string {
  if (hinglish) {
    return (
      "- Stress, anxiety aur low mood common ho sakte hain, lekin persistent symptoms ko ignore nahi karna chahiye.\n" +
      "- Regular sleep, physical activity, social support aur relaxation practices helpful ho sakte hain.\n" +
      "- Agar symptoms daily life, work, study ya relationships ko affect kar rahe hain to mental-health professional se baat karein.\n" +
      "- Suicidal thoughts ya self-harm ka risk ho to immediate emergency/crisis support lein.\n" +
      "- Aap apne symptoms ke baare mein detail share kar sakte hain; main general information provide karunga."
    );
  }

  return (
    "- Stress, anxiety, and low mood can occur commonly, but persistent or impairing symptoms should not be ignored.\n" +
    "- Regular sleep, physical activity, social support, and relaxation practices may help.\n" +
    "- If symptoms interfere with daily life, work, study, or relationships, consider speaking with a mental-health professional.\n" +
    "- Suicidal thoughts or risk of self-harm require immediate emergency or crisis support.\n" +
    "- You can describe your symptoms and I can provide general educational information."
  );
}

function heartResponse(
  hinglish: boolean,
): string {
  if (hinglish) {
    return (
      "- Heart health ke liye blood pressure, cholesterol, blood sugar, physical activity, sleep aur smoking status important factors hain.\n" +
      "- Balanced diet aur regular activity cardiovascular health ko support karte hain.\n" +
      "- Chest pain, severe breathlessness, fainting ya sudden sweating/nausea ke saath chest discomfort ho to emergency care lein.\n" +
      "- Risk factors ko clinician ke saath regularly review karna useful hai."
    );
  }

  return (
    "- Heart health is influenced by blood pressure, cholesterol, blood glucose, physical activity, sleep, and smoking status.\n" +
    "- Balanced nutrition and regular physical activity support cardiovascular health.\n" +
    "- Chest pain, severe breathlessness, fainting, or chest discomfort with concerning symptoms requires emergency evaluation.\n" +
    "- Reviewing cardiovascular risk factors with a clinician is useful."
  );
}

function kidneyResponse(
  hinglish: boolean,
): string {
  if (hinglish) {
    return (
      "- Kidney health blood pressure, diabetes, hydration, medicines aur other conditions se affected ho sakti hai.\n" +
      "- Regularly high BP aur uncontrolled blood glucose kidney risk ko increase kar sakte hain.\n" +
      "- Kidney disease wale logon ko fluid, salt, protein ya medicines ke regarding individualized advice ki zarurat ho sakti hai.\n" +
      "- Blood in urine, very low urine output, severe swelling ya severe illness ke liye medical evaluation zaroori hai."
    );
  }

  return (
    "- Kidney health can be affected by blood pressure, diabetes, hydration, medicines, and other conditions.\n" +
    "- Persistently high blood pressure and uncontrolled blood glucose can increase kidney risk.\n" +
    "- People with kidney disease may need individualized advice about fluids, salt, protein, and medicines.\n" +
    "- Blood in urine, very low urine output, severe swelling, or severe illness should be medically evaluated."
  );
}

function liverResponse(
  hinglish: boolean,
): string {
  if (hinglish) {
    return (
      "- Liver health alcohol use, weight, metabolic health, infections aur medicines se affect ho sakti hai.\n" +
      "- Balanced diet aur healthy weight maintain karna helpful hai.\n" +
      "- Unnecessary supplements ya medicines avoid karein, especially high doses.\n" +
      "- Yellow eyes/skin, severe abdominal pain, confusion, vomiting blood ya black stool urgent evaluation require kar sakte hain."
    );
  }

  return (
    "- Liver health can be affected by alcohol use, weight, metabolic health, infections, and medicines.\n" +
    "- Balanced nutrition and healthy weight management can support liver health.\n" +
    "- Avoid unnecessary supplements or medicines, especially excessive doses.\n" +
    "- Yellowing of the eyes/skin, severe abdominal pain, confusion, vomiting blood, or black stool may require urgent evaluation."
  );
}

function hydrationResponse(
  hinglish: boolean,
): string {
  if (hinglish) {
    return (
      "- Hydration ki need weather, activity, body size aur medical conditions par depend karti hai.\n" +
      "- Pyaas, urine color aur fluid loss ko general indicators ke roop mein use kiya ja sakta hai.\n" +
      "- Vomiting, diarrhea, fever ya heavy sweating mein fluid loss increase ho sakta hai.\n" +
      "- Severe dehydration ke signs jaise confusion, fainting ya inability to keep fluids down ke liye urgent care lein."
    );
  }

  return (
    "- Hydration needs vary with weather, activity, body size, and medical conditions.\n" +
    "- Thirst and urine concentration can provide general clues about hydration status.\n" +
    "- Fluid losses can increase with vomiting, diarrhea, fever, or heavy sweating.\n" +
    "- Severe dehydration signs such as confusion, fainting, or inability to keep fluids down require urgent care."
  );
}

function assessmentResponse(
  hinglish: boolean,
  context: HealthContext,
): string {
  const risk =
    context.risk !== undefined
      ? `${context.risk}%`
      : "not available";

  const bmi =
    context.bmi !== undefined
      ? context.bmi.toFixed(1)
      : "not available";

  const score =
    context.healthScore !== undefined
      ? `${context.healthScore}/100`
      : "not available";

  if (hinglish) {
    return (
      `- Aapka latest DiaSense diabetes risk estimate ${risk} hai.\n` +
      `- BMI ${bmi} aur health score ${score} hai.\n` +
      `- Yeh estimate screening/risk information hai, diagnosis nahi.\n` +
      `- Agar risk elevated hai to qualified healthcare professional se timely evaluation discuss karein.\n` +
      `- Aap apne assessment ke kisi bhi specific part—risk, BMI, diet, exercise ya lifestyle—ke baare mein pooch sakte hain.`
    );
  }

  return (
    `- Your latest DiaSense diabetes risk estimate is ${risk}.\n` +
    `- Your BMI is ${bmi} and health score is ${score}.\n` +
    `- These are screening/risk indicators, not a diagnosis.\n` +
    `- If your risk is elevated, discuss timely evaluation with a qualified healthcare professional.\n` +
    `- You can ask about any part of your assessment, including risk, BMI, nutrition, exercise, or lifestyle.`
  );
}

function generalResponse(
  hinglish: boolean,
): string {
  if (hinglish) {
    return (
      "- Main health aur wellness ke general topics explain kar sakta hoon, including symptoms, nutrition, exercise, sleep, blood pressure, diabetes, heart health, medicines, vitamins aur lifestyle.\n" +
      "- Aap apna exact symptom/topic, kitne time se hai, severity aur relevant measurements share karein.\n" +
      "- Main general educational information de sakta hoon, lekin diagnosis nahi.\n" +
      "- Prescription medicine ko bina qualified clinician ki advice ke start/stop/change na karein.\n" +
      "- Agar aap specific question poochte hain to main us topic ke according detailed explanation dunga."
    );
  }

  return (
    "- I can explain many general health and wellness topics, including symptoms, nutrition, exercise, sleep, blood pressure, diabetes, heart health, medicines, vitamins, and lifestyle.\n" +
    "- Share the exact symptom or topic, how long it has been present, its severity, and any relevant measurements.\n" +
    "- I can provide general educational information, but I cannot diagnose you.\n" +
    "- Do not start, stop, or change prescription medicines without appropriate clinical advice.\n" +
    "- Ask a specific health question and I will explain it according to the topic."
  );
}

export function getLocalHealthAnswer(
  message: string,
  context: HealthContext,
): HealthResponse {
  const text = normalize(message);
  const hinglish = isHinglish(message);

  if (
    containsAny(
      text,
      emergencyKeywords,
    )
  ) {
    return emergencyResponse(
      hinglish,
    );
  }

  if (
    /\b(assessment|risk|risk percentage|risk score|health score|bmi|my result|my report|result|report)\b/i.test(
      text,
    )
  ) {
    return {
      topic: "assessment",
      emergency: false,
      answer: assessmentResponse(
        hinglish,
        context,
      ),
    };
  }

  if (
    /\b(diabetes|diabetic|blood sugar|glucose|hba1c|insulin|sugar level)\b/i.test(
      text,
    )
  ) {
    return {
      topic: "diabetes",
      emergency: false,
      answer: diabetesResponse(
        hinglish,
        context,
      ),
    };
  }

  if (
    /\b(bp|blood pressure|hypertension|systolic|diastolic)\b/i.test(
      text,
    )
  ) {
    return {
      topic: "blood pressure",
      emergency: false,
      answer: bloodPressureResponse(
        hinglish,
      ),
    };
  }

  if (
    /\b(fever|temperature|bukhar)\b/i.test(
      text,
    )
  ) {
    return {
      topic: "fever",
      emergency: false,
      answer: feverResponse(
        hinglish,
      ),
    };
  }

  if (
    /\b(headache|migraine|head pain|sir dard|sar dard)\b/i.test(
      text,
    )
  ) {
    return {
      topic: "headache",
      emergency: false,
      answer: headacheResponse(
        hinglish,
      ),
    };
  }

  if (
    /\b(cough|cold|flu|sore throat|khansi|zukam|gala dard)\b/i.test(
      text,
    )
  ) {
    return {
      topic: "respiratory",
      emergency: false,
      answer: coughColdResponse(
        hinglish,
      ),
    };
  }

  if (
    /\b(stomach|gas|gastric|acidity|acid reflux|constipation|diarrhea|diarrhoea|vomiting|nausea|pet dard)\b/i.test(
      text,
    )
  ) {
    return {
      topic: "digestive health",
      emergency: false,
      answer: stomachResponse(
        hinglish,
      ),
    };
  }

  if (
    /\b(diet|food|nutrition|eat|eating|meal|protein|carbohydrate|carbs|fat|sugar|salt|khana|diet kya)\b/i.test(
      text,
    )
  ) {
    return {
      topic: "nutrition",
      emergency: false,
      answer: nutritionResponse(
        hinglish,
      ),
    };
  }

  if (
    /\b(exercise|workout|gym|walking|walk|running|yoga|fitness|activity|steps)\b/i.test(
      text,
    )
  ) {
    return {
      topic: "exercise",
      emergency: false,
      answer: exerciseResponse(
        hinglish,
      ),
    };
  }

  if (
    /\b(sleep|insomnia|sleeping|neend|nind|snoring)\b/i.test(
      text,
    )
  ) {
    return {
      topic: "sleep",
      emergency: false,
      answer: sleepResponse(
        hinglish,
      ),
    };
  }

  if (
    /\b(weight|weight loss|lose weight|obesity|overweight|underweight|bmi)\b/i.test(
      text,
    )
  ) {
    return {
      topic: "weight",
      emergency: false,
      answer: weightResponse(
        hinglish,
      ),
    };
  }

  if (
    /\b(vitamin|vitamins|vit d|vitamin d|vitamin b12|iron|calcium|zinc|supplement)\b/i.test(
      text,
    )
  ) {
    return {
      topic: "vitamins",
      emergency: false,
      answer: vitaminsResponse(
        hinglish,
      ),
    };
  }

  if (
    /\b(medicine|medication|tablet|drug|side effect|paracetamol|ibuprofen|antibiotic)\b/i.test(
      text,
    )
  ) {
    return {
      topic: "medication",
      emergency: false,
      answer: medicineResponse(
        hinglish,
      ),
    };
  }

  if (
    /\b(skin|rash|acne|itching|itch|allergy|pimples)\b/i.test(
      text,
    )
  ) {
    return {
      topic: "skin",
      emergency: false,
      answer: skinResponse(
        hinglish,
      ),
    };
  }

  if (
    /\b(stress|anxiety|depression|sad|mental health|panic|tension|mood)\b/i.test(
      text,
    )
  ) {
    return {
      topic: "mental health",
      emergency: false,
      answer: mentalHealthResponse(
        hinglish,
      ),
    };
  }

  if (
    /\b(heart|cardiac|cholesterol|heart attack|palpitation|heartbeat)\b/i.test(
      text,
    )
  ) {
    return {
      topic: "heart health",
      emergency: false,
      answer: heartResponse(
        hinglish,
      ),
    };
  }

  if (
    /\b(kidney|renal|urine|creatinine)\b/i.test(
      text,
    )
  ) {
    return {
      topic: "kidney",
      emergency: false,
      answer: kidneyResponse(
        hinglish,
      ),
    };
  }

  if (
    /\b(liver|liver health|fatty liver|jaundice)\b/i.test(
      text,
    )
  ) {
    return {
      topic: "liver",
      emergency: false,
      answer: liverResponse(
        hinglish,
      ),
    };
  }

  if (
    /\b(water|hydration|dehydration|pani|paani|fluids)\b/i.test(
      text,
    )
  ) {
    return {
      topic: "hydration",
      emergency: false,
      answer: hydrationResponse(
        hinglish,
      ),
    };
  }

  return {
    topic: "general health",
    emergency: false,
    answer: generalResponse(
      hinglish,
    ),
  };
}