export async function getEmbedding(query: string): Promise<any> {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append(
      "Authorization",
      process.env.AI_TOOLS_AUTH_HEADER || ''
    );

    var raw = JSON.stringify({
      text: [query],
    });

    var requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    const embeddings = await fetch(
      `${process.env.AI_TOOLS_BASE_URL}/t2embedding/openai/remote`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => result)
      .catch((error) => console.log("error", error));
    
    if (embeddings) return embeddings
    else return []
}