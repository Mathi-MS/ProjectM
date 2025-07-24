// Integration test for Form Roles functionality
// Run this in browser console to test the API integration

const testFormRolesIntegration = async () => {
  console.log("🧪 Starting Form Roles Integration Test...");

  try {
    // Test 1: Fetch users for autocomplete
    console.log("\n1️⃣ Testing Users Autocomplete API...");
    const usersResponse = await fetch("/api/users/autocomplete", {
      headers: {
        Authorization: `Bearer ${
          localStorage.getItem("token") || "your-token-here"
        }`,
      },
    });

    if (!usersResponse.ok) {
      throw new Error(`Users API failed: ${usersResponse.status}`);
    }

    const usersData = await usersResponse.json();
    console.log(
      "✅ Users fetched successfully:",
      usersData.users?.length || 0,
      "users"
    );

    if (usersData.users && usersData.users.length > 0) {
      console.log("📋 Sample user:", usersData.users[0]);
    }

    // Test 2: Create form with roles
    console.log("\n2️⃣ Testing Form Creation with Roles...");
    const testFormData = {
      formName: `Test Form with Roles - ${new Date().toISOString()}`,
      initiator: usersData.users?.[0]?.id,
      reviewer: usersData.users?.[1]?.id,
      approver: usersData.users?.[2]?.id,
    };

    const createResponse = await fetch("/api/forms/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          localStorage.getItem("token") || "your-token-here"
        }`,
      },
      body: JSON.stringify(testFormData),
    });

    if (!createResponse.ok) {
      throw new Error(`Form creation failed: ${createResponse.status}`);
    }

    const createData = await createResponse.json();
    console.log("✅ Form created successfully:", createData.form?.formName);
    console.log("👥 Roles assigned:", {
      initiator: createData.form?.initiator?.name,
      reviewer: createData.form?.reviewer?.name,
      approver: createData.form?.approver?.name,
    });

    // Test 3: Fetch forms to verify role display
    console.log("\n3️⃣ Testing Forms List with Roles...");
    const formsResponse = await fetch("/api/forms?limit=5", {
      headers: {
        Authorization: `Bearer ${
          localStorage.getItem("token") || "your-token-here"
        }`,
      },
    });

    if (!formsResponse.ok) {
      throw new Error(`Forms list failed: ${formsResponse.status}`);
    }

    const formsData = await formsResponse.json();
    console.log(
      "✅ Forms fetched successfully:",
      formsData.forms?.length || 0,
      "forms"
    );

    if (formsData.forms && formsData.forms.length > 0) {
      const sampleForm = formsData.forms[0];
      console.log("📋 Sample form with roles:", {
        name: sampleForm.formName,
        initiator: sampleForm.initiator?.name || "N/A",
        reviewer: sampleForm.reviewer?.name || "N/A",
        approver: sampleForm.approver?.name || "N/A",
      });
    }

    // Test 4: Update form roles (if we have a form ID)
    if (createData.form?.id) {
      console.log("\n4️⃣ Testing Form Update with Roles...");
      const updateData = {
        formName: createData.form.formName,
        fields: [],
        initiator: usersData.users?.[2]?.id, // Switch roles
        reviewer: usersData.users?.[0]?.id,
        approver: usersData.users?.[1]?.id,
      };

      const updateResponse = await fetch(`/api/forms/${createData.form.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            localStorage.getItem("token") || "your-token-here"
          }`,
        },
        body: JSON.stringify(updateData),
      });

      if (!updateResponse.ok) {
        throw new Error(`Form update failed: ${updateResponse.status}`);
      }

      const updateResult = await updateResponse.json();
      console.log("✅ Form updated successfully");
      console.log("👥 Updated roles:", {
        initiator: updateResult.form?.initiator?.name,
        reviewer: updateResult.form?.reviewer?.name,
        approver: updateResult.form?.approver?.name,
      });
    }

    console.log(
      "\n🎉 All tests passed! Form Roles integration is working correctly."
    );
  } catch (error) {
    console.error("❌ Integration test failed:", error);
    console.log(
      "💡 Make sure you're logged in and the backend is running on port 5001"
    );
  }
};

// Export for use in browser console
window.testFormRolesIntegration = testFormRolesIntegration;

console.log(
  "🔧 Integration test loaded. Run 'testFormRolesIntegration()' in console to test."
);
