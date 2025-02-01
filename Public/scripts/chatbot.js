import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyC_xkU4odYJ8lB9y0qzymqMrWybuNrqkCA";
const genAI = new GoogleGenerativeAI(API_KEY);

let messages = {
    history: [],
};

let businessInfo = `
This section below is the data that the chatbot will use to collect information from other tables. 
use companyId as 1 and retrieve other tables accordingly when prompted
    Company details:
    name: Apple Inc.
    companyId: 1

    1. What is Net-Zero Carbon Emissions?
    Net-zero carbon emissions refers to balancing the amount of CO₂ emitted with an equivalent amount removed or offset, helping to combat climate change.

    2. Why is Achieving Net-Zero Important?
    Achieving net-zero is crucial to reducing global warming, minimizing environmental damage, and ensuring a sustainable future.

    3. How Can My Company Achieve Net-Zero?
    Start by reducing emissions through energy efficiency and renewable energy. Offset the remaining emissions by supporting projects like reforestation.

    4. What Are Carbon Offsets?
    Carbon offsets are credits purchased to balance out emissions by investing in projects that reduce or capture CO₂, like renewable energy or forest conservation.

    5. What Are Scope 1, 2, and 3 Emissions?
    Scope 1: Direct emissions from your company’s operations.
    Scope 2: Indirect emissions from purchased energy.
    Scope 3: Indirect emissions from your supply chain and activities like travel.
    
    6. How Do I Track My Carbon Footprint?
    You can track your carbon footprint using tools like carbon calculators or carbon accounting software, and by conducting regular emissions audits.

    7. What Are the Benefits of Achieving Net-Zero?
    Benefits include cost savings, regulatory compliance, improved brand reputation, and contributing to global environmental efforts.

    8. What Are Carbon Credits and How Do They Work?
    Carbon credits represent one metric ton of CO₂ removed or avoided. Companies buy them to offset their emissions and support environmental projects.

    9. Can Small Businesses Achieve Net-Zero?
    Yes, small businesses can reduce emissions by implementing energy-saving practices and offsetting their remaining emissions.

    10. How Do I Start the Journey Toward Net-Zero?
    Begin with a carbon audit to assess your emissions, set reduction goals, and explore offsetting options to balance remaining emissions.

    11. What Are Emission Reduction Strategies?
    Strategies include adopting renewable energy, improving energy efficiency, and reducing waste and emissions from transportation.

    12. What Is the Role of Technology in Achieving Net-Zero?
    Technology plays a key role in optimizing energy use, enabling better tracking of emissions, and supporting innovative solutions like carbon capture.

    13. What Is a Sustainability Report?
    A sustainability report outlines a company’s environmental impact, efforts to reduce emissions, and progress toward sustainability goals.

    14. What Challenges Do Companies Face in Achieving Net-Zero?
    Challenges include high implementation costs, complexity in reducing Scope 3 emissions, and the need for accurate data to measure progress.

    15. Can Individuals Contribute to Net-Zero?
    Yes, individuals can reduce their carbon footprint by using less energy, driving less, and supporting businesses with sustainable practices.
    
    16. what is our company's total emissions?
    The company's current total carbon emission cost is 3375200.68 tons. For more details such as the different sectors contributing to the carbon emission, you can toggle Carbon Emissions in the dashboard

    17. What is our total cost?
    The company's current total operational cost is 4.46 billion. For more details such as the different sectors contributing to the operational cost, you can toggle operational costs in the dashboard

    18. What is the current campaign about?
    The current campaign is about raising awareness


    Instructions for Tone:
    Formal but Friendly: Maintain a respectful and professional tone while ensuring the message feels approachable.
    Concise Responses: Keep answers clear and to the point. Avoid long paragraphs; break information into digestible bits.
    Use Simple Language: Avoid jargon where possible to make the content accessible, but don’t sacrifice professionalism.
    Consistency: Maintain a consistent tone across all responses, ensuring it feels like one voice.
    Empathy: Show understanding and offer reassurance, especially in cases of confusion or more complex queries.
`;

// Function to fetch the data from the /chatbot/data route
async function fetchDataFromAPI() {
    try {
        const response = await fetch('/chatbot/data');  // Ensure your backend returns data in the expected format
        if (!response.ok) {
            throw new Error('Failed to fetch SQL data');
        }

        const data = await response.json();
        console.log("Fetched SQL data:", data);  // Log the raw response

        if (data.sqlDetails && Array.isArray(data.sqlDetails) && data.sqlDetails.length > 0) {
            data.sqlDetails.forEach((table, index) => {
                // Check if the table has valid records (non-empty)
                if (Array.isArray(table) && table.length > 0) {
                    // Check if the table has the expected keys
                    let tableData = `Table ${index + 1}: \n`;
                    table.forEach(record => {
                        // Format each record based on your desired structure
                        tableData += `\nRecord: ${JSON.stringify(record, null, 2)}`;
                    });
                    // Append the table data to businessInfo
                    businessInfo += `\n${tableData}`;
                } else {
                    console.warn(`Table ${index + 1} has no records or invalid format`);
                }
            });

            console.log("Updated businessInfo with SQL data: ", businessInfo);  // Log the updated businessInfo
        } else {
            console.warn("No SQL data found in the response");
        }
    } catch (error) {
        console.error("Error fetching SQL data:", error);
    }
}


// Function to initialize the AI model
async function initializeChat() {
    await fetchDataFromAPI();  // Fetch SQL data before initializing the AI model

    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: businessInfo
    });

    return model;
}

// Function to send a message and handle chat
async function sendMessage() {
    console.log(messages);
    const userMessage = document.querySelector(".chat-window input").value;

    if (userMessage.length) {
        try {
            document.querySelector(".chat-window input").value = "";  // Clear input field
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend", `
                <div class="user">
                    <p>${userMessage}</p>
                </div>
            `);

            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend", `
                <div class="loader"></div>

            `);

            const model = await initializeChat(); // Ensure model is initialized with fresh data
            const chat = model.startChat(messages);
            
            let result = await chat.sendMessage(userMessage);

            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend", `
                <div class="model">
                    <p>${result.response.text()}</p>
                </div>
            `);

            // Store user and model messages in history
            messages.history.push({
                role: "user",
                parts: [{ text: userMessage }]
            });

            messages.history.push({
                role: "model",
                parts: [{ text: result.response.text() }]
            });

        } catch (error) {
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend", `
                <div class="error">
                    <p>The message could not be sent. Please try again</p>
                </div>
            `);
        }

        document.querySelector(".chat-window .chat .loader").remove();
    }
}

// Event listener for send button
document.querySelector(".chat-window .input-area button").addEventListener("click", () => sendMessage());

document.querySelector(".chat-button").addEventListener("click", () => {
    document.querySelector("body").classList.add("chat-open")
});

document.querySelector(".chat-window button.close").addEventListener("click", () => {
    document.querySelector("body").classList.remove("chat-open")
});

