export const JSONparse = (response: string): unknown => {
	const JSONstring = response.replaceAll(/\`{3}(json)?/g, '').trim(); 
	const json = JSON.parse(JSONstring);	

	return json;
}