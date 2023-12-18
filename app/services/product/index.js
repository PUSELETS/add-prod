export const addNewProduct = async (formData) => {
    try {
      const response = await fetch("/api/admin/add-product", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      return data;
    } catch (error) {
      console.log(error);
    }
  };