import { getToken } from "./auth";

export async function getDevices() {
  const graphEndpoint = "https://graph.microsoft.com/beta/me/devices";

  const token = await getToken();
  console.log("token", token);

  if (!token) {
    throw new Error("No token passed");
  }

  const headers = new Headers();
  const bearer = "Bearer " + token;
  headers.append("Authorization", bearer);
  const options = {
    method: "GET",
    headers: headers,
  };

  const response = await fetch(graphEndpoint, options);
  const data = await response.json();

  return data;
}

export async function getContacts() {
  const token = await getToken();
  console.log('token', token);

  const headers = new Headers();
  const bearer = "Bearer " + token;
  headers.append("Authorization", bearer);
  const options = {
    method: "GET",
    headers: headers
  };
  const graphEndpoint = "https://graph.microsoft.com/beta/me/people/";

  const response = await fetch(graphEndpoint, options);
  const data = await response.json();

  console.log('contacts', data);

  return data.value;

}