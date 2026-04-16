export async function POST(req) {
  try {
    const { numeroIdentificacion } = await req.json();

    const tokenResp = await fetch(process.env.OAUTH_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
          ).toString("base64"),
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = await tokenResp.json();

    if (!tokenResp.ok) {
      return Response.json(
        {
          Estado: "Error",
          Datos: [],
          Mensajes: ["No se pudo obtener el token de autenticación"],
          detalle: tokenData,
        },
        { status: 500 }
      );
    }

    const apiResp = await fetch(
      `${process.env.APEX_API_URL}?numeroIdentificacion=${encodeURIComponent(
        numeroIdentificacion || ""
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: "application/json",
        },
      }
    );

    const text = await apiResp.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = {
        Estado: apiResp.ok ? "OK" : "Error",
        Datos: [],
        Mensajes: [text || "La respuesta del servicio no es un JSON válido"],
      };
    }

    return Response.json(data, { status: apiResp.status });
  } catch (error) {
    return Response.json(
      {
        Estado: "Error",
        Datos: [],
        Mensajes: ["Error interno al consultar el servicio"],
        detalle: error.message,
      },
      { status: 500 }
    );
  }
}
