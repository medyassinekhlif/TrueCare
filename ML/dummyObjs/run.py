from pymongo import MongoClient
client = MongoClient("mongodb+srv://khlifyassin55:WebRTC55555@cluster.skokpsh.mongodb.net/true")
db = client["true"]
bulletins = db["medicalbulletins"].find()
for bulletin in bulletins:
    print(f"Bulletin {bulletin['_id']}:")
    fields = [
        ("treatmentDetails.sessionsAttended", bulletin.get("treatmentDetails", {}).get("sessionsAttended")),
        ("treatmentDetails.caseSeverity", bulletin.get("treatmentDetails", {}).get("caseSeverity")),
        ("financialInfo.totalAmountPaid", bulletin.get("financialInfo", {}).get("totalAmountPaid")),
        ("treatmentDetails.treatmentDuration", bulletin.get("treatmentDetails", {}).get("treatmentDuration")),
        ("treatmentDetails.treatmentType", bulletin.get("treatmentDetails", {}).get("treatmentType"))
    ]
    for name, value in fields:
        print(f"  {name}: {value} (type: {type(value).__name__})")