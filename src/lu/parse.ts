export const JSONparse = (response: string): unknown => {
	try{
		console.log(0, response);
		const JSONstring = response.replaceAll(/\`{3}(json)?/g, '').trim(); 
		const json = JSON.parse(JSONstring);	
		return json;

	} catch(err) {
		console.error(err);
		throw new Error('Invalid JSON');
	}
}