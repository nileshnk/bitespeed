import { Request, Response } from "express";
import { query } from "../db/";
import { QueryResult } from "pg";
export async function UserIdentify(req: Request, res: Response) {
  const body = req.body;

  const email: string = body.email;
  const phoneNumber: string = body.phoneNumber;

  // validate request body
  if (!email && !phoneNumber) {
    return res.status(400).json({ error: "Email or phone number is required" });
  }

  // find if there's a contact entry with either phone or email provided
  const listAllData: QueryResult = await query(
    "SELECT * FROM contact WHERE email=$1 OR phonenumber=$2 ORDER BY linkprecedence DESC;",
    [email, phoneNumber]
  );
  const currentTimestamp = new Date().toISOString();

  enum LinkPrecedence {
    PRIMARY = "primary",
    SECONDARY = "secondary",
  }

  type IdentifyResponse = {
    primaryContactId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[] | null;
  };

  let response: IdentifyResponse = {} as IdentifyResponse;

  // if no records are found either of email or phone numbers, then create a new record
  if (listAllData.rowCount == 0) {
    const data: QueryResult = await query(
      "INSERT INTO contact (phoneNumber, email, linkPrecedence, createdAt, updatedAt) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, phonenumber, linkprecedence, linkedid",
      [
        phoneNumber,
        email,
        LinkPrecedence.PRIMARY,
        currentTimestamp,
        currentTimestamp,
      ]
    );

    if (data.rowCount && data.rowCount > 0) {
      response = {
        primaryContactId: data.rows[0].id,
        emails: [data.rows[0].email],
        phoneNumbers: [data.rows[0].phonenumber],
        secondaryContactIds: [],
      };
    }
  } else {
    let allEmails: Set<string> = new Set();
    let allPhoneNo: Set<string> = new Set();
    let allSecondaryIds: Set<number> = new Set();
    let primaryContactId: number = 0;
    let primaryAccountCount: number = 0;

    listAllData.rows.forEach((row) => {
      allEmails.add(row.email);
      allPhoneNo.add(row.phonenumber);
      // console.log("=====", row);
      if (row.linkprecedence == LinkPrecedence.SECONDARY) {
        allSecondaryIds.add(row.id);
        primaryContactId = row.linkedid;
      } else {
        primaryContactId = row.id;
        primaryAccountCount++;
      }
    });
    // check if there are two primary contact
    if (primaryAccountCount > 1) {
      if (listAllData.rowCount == 2) {
        // update the second contact with secondary and add linked id of the first
        const firstContactId = listAllData.rows[0].id;
        const secondContactId = listAllData.rows[1].id;
        const updateContact = await query(
          "UPDATE contact SET linkprecedence=$1, linkedid=$2 WHERE id=$3 RETURNING id, email, phonenumber, linkprecedence, linkedid",
          [LinkPrecedence.SECONDARY, firstContactId, secondContactId]
        );
        primaryContactId = firstContactId;
        allSecondaryIds.add(secondContactId);
        console.log(firstContactId, secondContactId);
        console.log(updateContact.rows);
        response = {
          primaryContactId: primaryContactId,
          emails: Array.from(allEmails),
          phoneNumbers: Array.from(allPhoneNo),
          secondaryContactIds: Array.from(allSecondaryIds),
        };
        return res.json(response);
      }
    }

    // check if the combination of email and phone number exists in all rows including secondary contacts rows which are linked with primary contact
    const checkContact: QueryResult = await query(
      "SELECT * FROM contact c1 INNER JOIN contact c2 ON c1.id=c2.linkedid WHERE (c1.email=$1 and c2.phonenumber=$2) OR (c2.email=$1 and c1.phonenumber=$2);",
      [email, phoneNumber]
    );

    // if there's no contact with either linkedid or with phonenumber and email, then we create a new contact row
    if (checkContact.rowCount == 0) {
      const data: QueryResult = await query(
        "INSERT INTO contact (phonenumber, email, linkprecedence, linkedid, createdat, updatedat) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, phonenumber, linkprecedence, linkedid",
        [
          phoneNumber,
          email,
          LinkPrecedence.SECONDARY,
          primaryContactId,
          currentTimestamp,
          currentTimestamp,
        ]
      );

      if (data.rows.length > 0) {
        allEmails.add(email);
        allPhoneNo.add(phoneNumber);
        allSecondaryIds.add(data.rows[0].id);
      }
    }

    const getAllLinkedContacts = await query(
      "SELECT * FROM contact WHERE id=$1 OR linkedid=$1",
      [primaryContactId]
    );
    if (getAllLinkedContacts.rowCount && getAllLinkedContacts.rowCount > 0) {
      getAllLinkedContacts.rows.forEach((row) => {
        allEmails.add(row.email);
        allPhoneNo.add(row.phonenumber);
        if (row.linkprecedence == LinkPrecedence.SECONDARY) {
          allSecondaryIds.add(row.id);
          primaryContactId = row.linkedid;
        } else {
          primaryContactId = row.id;
        }
      });
    }

    response = {
      primaryContactId: primaryContactId,
      emails: Array.from(allEmails),
      phoneNumbers: Array.from(allPhoneNo),
      secondaryContactIds: Array.from(allSecondaryIds),
    };
  }

  return res.json({ contact: response });
}
