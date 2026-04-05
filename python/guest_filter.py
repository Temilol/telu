import pandas as pd

# df = pd.read_csv("guest.csv")

# filtered_df = df[
#     (df["Traditional Ceremony"] == "Attending") |
#     (df["Wedding Ceremony"] == "Attending") |
#     (df["Wedding Reception"] == "Attending")
# ]

# filtered_df.to_csv("filteredGuests.csv", index=False)

# print(filtered_df.head())

# import pandas as pd

# # Load CSV
# df = pd.read_csv("guest.csv")

# # Filter all attendees
# filtered_df = df[
#     (df["Traditional Ceremony"] == "Attending") |
#     (df["Wedding Ceremony"] == "Attending") |
#     (df["Wedding Reception"] == "Attending")
# ]

# # Save all attendees
# filtered_df.to_csv("filteredGuests.csv", index=False)

# # Filter Traditional Ceremony attendees
# traditional_df = df[df["Traditional Ceremony"] == "Attending"]
# traditional_df.to_csv("traditionalGuests.csv", index=False)

# # Filter Wedding Ceremony / Reception attendees
# wedding_df = df[
#     (df["Wedding Ceremony"] == "Attending") |
#     (df["Wedding Reception"] == "Attending")
# ]
# wedding_df.to_csv("weddingGuests.csv", index=False)

# # Optional preview
# print("All Attendees:\n", filtered_df.head())
# print("Traditional Ceremony:\n", traditional_df.head())
# print("Wedding Ceremony/Reception:\n", wedding_df.head())


import pandas as pd

# Load CSV
df = pd.read_csv("guests.csv")

# Filter all attendees
filtered_df = df[
    (df["Traditional Ceremony"] == "Attending") |
    (df["Wedding Ceremony"] == "Attending") |
    (df["Wedding Reception"] == "Attending")
]

# Save all attendees
filtered_df.to_csv("filteredGuests.csv", index=False)

# Traditional Ceremony only, drop wedding columns
traditional_df = df[df["Traditional Ceremony"] == "Attending"].copy()
traditional_df = traditional_df.drop(columns=["Wedding Ceremony", "Wedding Reception"])
traditional_df.to_csv("traditionalGuests.csv", index=False)

# Wedding Ceremony/Reception only, drop traditional column
wedding_df = df[
    (df["Wedding Ceremony"] == "Attending") |
    (df["Wedding Reception"] == "Attending")
].copy()
wedding_df = wedding_df.drop(columns=["Traditional Ceremony"])
wedding_df.to_csv("weddingGuests.csv", index=False)

# Optional preview
print("All Attendees:\n", filtered_df.head())
print("Traditional Ceremony:\n", traditional_df.head())
print("Wedding Ceremony/Reception:\n", wedding_df.head())



# # Step 1: Filter to attendees
# attending = df[
#     (df["Traditional Ceremony"] == "Attending") |
#     (df["Wedding Ceremony"] == "Attending") |
#     (df["Wedding Reception"] == "Attending")
# ].copy()

# # Step 2: Identify "new household" when Title is NOT empty
# attending["New Household"] = attending["Title"].notna() & (attending["Title"] != "")

# # Step 3: Create a household ID by cumulative sum
# attending["Household ID"] = attending["New Household"].cumsum()

# # Step 4: Build full names
# attending["Full Name"] = (
#     attending["Title"].fillna("") + " " +
#     attending["First Name"].fillna("") + " " +
#     attending["Last Name"].fillna("")
# ).str.replace("  ", " ").str.strip()

# # Step 5: Group into households
# households = attending.groupby("Household ID")["Full Name"].apply(list).reset_index()

# print(households)


# Step 1: Filter to attendees
# attending = df[
#     (df["Traditional Ceremony"] == "Attending") |
#     (df["Wedding Ceremony"] == "Attending") |
#     (df["Wedding Reception"] == "Attending")
# ].copy()

# # Clean blanks
# attending["Title"] = attending["Title"].fillna("")
# attending["Last Name"] = attending["Last Name"].fillna("")

# # Step 2: Detect new household
# attending["Prev Last Name"] = attending["Last Name"].shift(1)

# attending["New Household"] = (
#     (attending["Title"] != "") &  # has a title
#     (attending["Last Name"] != attending["Prev Last Name"])  # different surname than previous
# )

# # First row should always be a new household
# attending.loc[attending.index[0], "New Household"] = True

# # Step 3: Assign household IDs
# attending["Household ID"] = attending["New Household"].cumsum()

# # Step 4: Build full names
# attending["Full Name"] = (
#     attending["Title"] + " " +
#     attending["First Name"].fillna("") + " " +
#     attending["Last Name"]
# ).str.replace("  ", " ").str.strip()

# # Step 5: Group
# households = attending.groupby("Household ID")["Full Name"].apply(list).reset_index()

# # Step 6: Clean for CSV
# households["Members"] = households["Full Name"].apply(lambda x: ", ".join(x))
# households = households.drop(columns=["Full Name"])

# # Step 7: Save
# households.to_csv("households.csv", index=False)

# print(households.head())