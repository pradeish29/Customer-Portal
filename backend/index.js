const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const request = require("request");
const X2JS = require("x2js");
const xml2js = require('xml2js');
const axios = require('axios');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// SOAP Login 
app.post("/custlogin", (req, res) => {
    const { username, password } = req.body;

    const soapBody = `
        <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
                       xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
            <soap:Header/>
            <soap:Body>
                <urn:ZfmLoginPm>
                    <CustomerId>${username}</CustomerId>
                    <Password>${password}</Password>
                </urn:ZfmLoginPm>
            </soap:Body>
        </soap:Envelope>
    `;

    const options = {
        method: 'POST',
        url: 'http://azktlds5cp.kcloud.com:8000/sap/bc/srt/scs/sap/zrfc_cust_login_pm?sap-client=100',
        headers: {
            'Content-Type': 'application/soap+xml;charset=UTF-8',
            'Authorization': 'Basic SzkwMTUwMzpQcmFkZWlzaDI5',
            'Cookie': 'sap-usercontext=sap-client=100'
        },
        body: soapBody
    };

    request(options, (error, response, body) => {
        if (error) {
            console.error("Request error:", error);
            return res.status(500).send({ error: "Request failed" });
        }

        const x2js = new X2JS();
        const jsonResponse = x2js.xml2js(body);
        res.send(jsonResponse);
    });
});

//Profile
app.post('/custprofile', (req, res) => {
    const { customerId } = req.body;

    const soapBody = `
        <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
                       xmlns:n0="urn:sap-com:document:sap:soap:functions:mc-style">
            <soap:Header/>
            <soap:Body>
                <n0:ZfmCustProfilePm>
                    <CustomerId>${customerId}</CustomerId>
                </n0:ZfmCustProfilePm>
            </soap:Body>
        </soap:Envelope>
    `;

    const options = {
        method: 'POST',
        url: 'http://azktlds5cp.kcloud.com:8000/sap/bc/srt/scs/sap/zrfc_cust_prof_pm?sap-client=100',
        headers: {
            'Content-Type': 'application/soap+xml;charset=UTF-8',
            'Authorization': 'Basic SzkwMTUwMzpQcmFkZWlzaDI5', // <- use your base64-encoded credentials
            'Cookie': 'sap-usercontext=sap-client=100'
        },
        body: soapBody
    };

    request(options, (error, response, body) => {
        if (error) {
            console.error("Request error:", error);
            return res.status(500).send({ error: "Request failed" });
        }

        const x2js = new X2JS();
        const jsonResponse = x2js.xml2js(body);

try {
    const responseBody = jsonResponse?.Envelope?.Body;
    const profile = responseBody?.ZfmCustProfilePmResponse?.CustomerProfile;

    if (profile) {
        res.send({
            Kunnr: profile.Kunnr,
            Name1: profile.Name1,
            Land1: profile.Land1,
            Ort01: profile.Ort01,
            Pstlz: profile.Pstlz,
            Stras: profile.Stras
        });
    } else {
        console.log("SAP response structure:", JSON.stringify(responseBody, null, 2));
        res.status(500).send({ error: 'Invalid SAP response', raw: responseBody });
    } 
} catch (err) {
    console.error("Parsing error:", err);
    res.status(500).send({ error: "Parsing failed", details: err.message });
}
  

    });
});

//INQUIRY
app.post('/custinquiry', (req, res) => {
    // const customerId = 3; // Hardcoded
    const { customerId } = req.body;

    const soapBody = `
        <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
                       xmlns:n0="urn:sap-com:document:sap:soap:functions:mc-style">
            <soap:Header/>
            <soap:Body>
                <n0:ZfmCustInquiryPm>
                    <CustomerId>${customerId}</CustomerId>
                </n0:ZfmCustInquiryPm>
            </soap:Body>
        </soap:Envelope>
    `;

    const options = {
        method: 'POST',
        url: 'http://azktlds5cp.kcloud.com:8000/sap/bc/srt/scs/sap/zrfc_cust_inquiry_pm?sap-client=100',
        headers: {
            'Content-Type': 'application/soap+xml;charset=UTF-8',
            'Authorization': 'Basic SzkwMTUwMzpQcmFkZWlzaDI5',
            'Cookie': 'sap-usercontext=sap-client=100'
        },
        body: soapBody
    };

    request(options, (error, response, body) => {
        if (error) {
            console.error("SAP request error:", error);
            return res.status(502).json({ error: "Failed to contact SAP system" });
        }

        // Just return the raw XML response from SAP
        res.set('Content-Type', 'application/xml');
        res.status(200).send(body);
    });
});

//SALES
app.post('/custsales', (req, res) => {
    // const customerId = 3; // Hardcoded
    const { customerId } = req.body;

    const soapBody = `
        <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
                       xmlns:n0="urn:sap-com:document:sap:soap:functions:mc-style">
            <soap:Header/>
            <soap:Body>
                <n0:ZfmCustSalesPm>
                    <CustomerId>${customerId}</CustomerId>
                </n0:ZfmCustSalesPm>
            </soap:Body>
        </soap:Envelope>
    `;

    const options = {
        method: 'POST',
        url: 'http://azktlds5cp.kcloud.com:8000/sap/bc/srt/scs/sap/zrfc_cust_sales_pm?sap-client=100',
        headers: {
            'Content-Type': 'application/soap+xml;charset=UTF-8',
            'Authorization': 'Basic SzkwMTUwMzpQcmFkZWlzaDI5',
            'Cookie': 'sap-usercontext=sap-client=100'
        },
        body: soapBody
    };

    request(options, (error, response, body) => {
        if (error) {
            console.error("SAP request error:", error);
            return res.status(502).json({ error: "Failed to contact SAP system" });
        }

        // Just return the raw XML response from SAP
        res.set('Content-Type', 'application/xml');
        res.status(200).send(body);
    });
});

//DELIVERY
app.post('/custdelivery', (req, res) => {
    // const customerId = 3; // Hardcoded
    const { customerId } = req.body;

    const soapBody = `
        <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
                       xmlns:n0="urn:sap-com:document:sap:soap:functions:mc-style">
            <soap:Header/>
            <soap:Body>
                <n0:ZfmCustDeliveryPm>
                    <CustomerId>${customerId}</CustomerId>
                </n0:ZfmCustDeliveryPm>
            </soap:Body>
        </soap:Envelope>
    `;

    const options = {
        method: 'POST',
        url: 'http://azktlds5cp.kcloud.com:8000/sap/bc/srt/scs/sap/zrfc_cust_delivery_pm?sap-client=100',
        headers: {
            'Content-Type': 'application/soap+xml;charset=UTF-8',
            'Authorization': 'Basic SzkwMTUwMzpQcmFkZWlzaDI5',
            'Cookie': 'sap-usercontext=sap-client=100'
        },
        body: soapBody
    };

    request(options, (error, response, body) => {
        if (error) {
            console.error("SAP request error:", error);
            return res.status(502).json({ error: "Failed to contact SAP system" });
        }

        // Just return the raw XML response from SAP
        res.set('Content-Type', 'application/xml');
        res.status(200).send(body);
    });
});

//CREDIT/DEBIT MEMOS
app.post('/custmemos', (req, res) => {
    const { customerId } = req.body;

    const soapBody = `
        <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
                       xmlns:n0="urn:sap-com:document:sap:soap:functions:mc-style">
            <soap:Header/>
            <soap:Body>
                <n0:ZfmCustMemoPm>
                    <CustomerId>${customerId}</CustomerId>
                </n0:ZfmCustMemoPm>
            </soap:Body>
        </soap:Envelope>
    `;

    const options = {
        method: 'POST',
        url: 'http://azktlds5cp.kcloud.com:8000/sap/bc/srt/scs/sap/zrfc_cust_memo_pm?sap-client=100',
        headers: {
            'Content-Type': 'application/soap+xml;charset=UTF-8',
            'Authorization': 'Basic SzkwMTUwMzpQcmFkZWlzaDI5', // Your Basic Auth
            'Cookie': 'sap-usercontext=sap-client=100'
        },
        body: soapBody
    };

    request(options, (error, response, body) => {
        if (error) {
            console.error("SAP memo request error:", error);
            return res.status(502).json({ error: "Failed to contact SAP system" });
        }

        res.set('Content-Type', 'application/xml');
        res.status(200).send(body);
    });
});

//OVERALL SALES
app.post('/custoverallsales', (req, res) => {
    const { customerId } = req.body;

    const soapBody = `
        <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
                       xmlns:n0="urn:sap-com:document:sap:soap:functions:mc-style">
            <soap:Header/>
            <soap:Body>
                <n0:ZfmCustOverallSalesPm>
                    <CustomerId>${customerId}</CustomerId>
                </n0:ZfmCustOverallSalesPm>
            </soap:Body>
        </soap:Envelope>
    `;

    const options = {
        method: 'POST',
        url: 'http://azktlds5cp.kcloud.com:8000/sap/bc/srt/scs/sap/zrfc_cust_overall_sales_pm?sap-client=100',
        headers: {
            'Content-Type': 'application/soap+xml;charset=UTF-8',
            'Authorization': 'Basic SzkwMTUwMzpQcmFkZWlzaDI5',
            'Cookie': 'sap-usercontext=sap-client=100'
        },
        body: soapBody
    };

    request(options, (error, response, body) => {
        if (error) {
            console.error("SAP overall sales request error:", error);
            return res.status(502).json({ error: "Failed to contact SAP system" });
        }

        res.set('Content-Type', 'application/xml');
        res.status(200).send(body);
    });
});

//AGING
app.post('/custaging', (req, res) => {
    const { customerId } = req.body;

    const soapBody = `
        <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
                       xmlns:n0="urn:sap-com:document:sap:soap:functions:mc-style">
            <soap:Header/>
            <soap:Body>
                <n0:ZfmCustAgingPm>
                    <CustomerId>${customerId}</CustomerId>
                </n0:ZfmCustAgingPm>
            </soap:Body>
        </soap:Envelope>
    `;

    const options = {
        method: 'POST',
        url: 'http://azktlds5cp.kcloud.com:8000/sap/bc/srt/scs/sap/zrfc_cust_aging_pm?sap-client=100',
        headers: {
            'Content-Type': 'application/soap+xml;charset=UTF-8',
            'Authorization': 'Basic SzkwMTUwMzpQcmFkZWlzaDI5',
            'Cookie': 'sap-usercontext=sap-client=100'
        },
        body: soapBody
    };

    request(options, (error, response, body) => {
        if (error) {
            console.error("SAP overall sales request error:", error);
            return res.status(502).json({ error: "Failed to contact SAP system" });
        }

        res.set('Content-Type', 'application/xml');
        res.status(200).send(body);
    });
});

//INVOICE LIST
app.post('/custinvoicelist', (req, res) => {
    const { customerId } = req.body;

    const soapBody = `
        <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
                       xmlns:n0="urn:sap-com:document:sap:soap:functions:mc-style">
            <soap:Header/>
            <soap:Body>
        <n0:ZfmCustInvoiceListPm >
 <CustomerId>${customerId}</CustomerId>
</n0:ZfmCustInvoiceListPm>
            </soap:Body>
        </soap:Envelope>
    `;

    const options = {
        method: 'POST',
        url: 'http://azktlds5cp.kcloud.com:8000/sap/bc/srt/scs/sap/zrfc_cust_invoice_list_pm?sap-client=100',
        headers: {
            'Content-Type': 'application/soap+xml;charset=UTF-8',
            'Authorization': 'Basic SzkwMTUwMzpQcmFkZWlzaDI5',
            'Cookie': 'sap-usercontext=sap-client=100'
        },
        body: soapBody
    };

    request(options, (error, response, body) => {
        if (error) {
            console.error("SAP overall sales request error:", error);
            return res.status(502).json({ error: "Failed to contact SAP system" });
        }

        res.set('Content-Type', 'application/xml');
        res.status(200).send(body);
    });
});

//INVOICE FILE working
// app.post('/custinvoicefile', (req, res) => {
//     const { customerId } = req.body;
//     const { vbeln } = req.body;


//     const soapBody = `
//         <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
//                        xmlns:n0="urn:sap-com:document:sap:soap:functions:mc-style">
//             <soap:Header/>
//             <soap:Body>
//         <n0:ZfmCustInvoiceFilePm >
//  <CustomerId>${customerId}</CustomerId>
//   <Vbeln>${vbeln}</Vbeln>
// </n0:ZfmCustInvoiceFilePm>
//             </soap:Body>
//         </soap:Envelope>
//     `;

//     const options = {
//         method: 'POST',
//         url: 'http://azktlds5cp.kcloud.com:8000/sap/bc/srt/scs/sap/zrfc_cust_invoice_file_pm?sap-client=100',
//         headers: {
//             'Content-Type': 'application/soap+xml;charset=UTF-8',
//             'Authorization': 'Basic SzkwMTUwMzpQcmFkZWlzaDI5',
//             'Cookie': 'sap-usercontext=sap-client=100'
//         },
//         body: soapBody
//     };

//     request(options, (error, response, body) => {
//         if (error) {
//             console.error("SAP overall sales request error:", error);
//             return res.status(502).json({ error: "Failed to contact SAP system" });
//         }

//         res.set('Content-Type', 'application/xml');
//         res.status(200).send(body);
//     });
// });

//invoice download
app.post('/custinvoicefile', (req, res) => {
    const { customerId, vbeln } = req.body;

    const soapBody = `
        <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
                       xmlns:n0="urn:sap-com:document:sap:soap:functions:mc-style">
            <soap:Header/>
            <soap:Body>
                <n0:ZfmCustInvoiceB64Pm>
                    <CustomerId>${customerId}</CustomerId>
                    <Vbeln>${vbeln}</Vbeln>
                </n0:ZfmCustInvoiceB64Pm>
            </soap:Body>
        </soap:Envelope>
    `;

    const options = {
        method: 'POST',
        url: 'http://azktlds5cp.kcloud.com:8000/sap/bc/srt/scs/sap/zrfc_cust_invoice_b64_pm?sap-client=100',
        headers: {
            'Content-Type': 'application/soap+xml;charset=UTF-8',
            'Authorization': 'Basic SzkwMTUwMzpQcmFkZWlzaDI5',
            'Cookie': 'sap-usercontext=sap-client=100'
        },
        body: soapBody
    };

    request(options, (error, response, body) => {
        if (error) {
            console.error("SAP invoice file request error:", error);
            return res.status(502).json({ error: "Failed to contact SAP system" });
        }

        // Parse the SOAP XML to extract PdfB64
        xml2js.parseString(body, { explicitArray: false }, (err, result) => {
            if (err) {
                console.error("Failed to parse SOAP response:", err);
                return res.status(500).json({ error: "Failed to parse response from SAP" });
            }

            try {
                const base64Pdf = result['env:Envelope']['env:Body']['n0:ZfmCustInvoiceB64PmResponse']['PdfB64'];
                return res.status(200).json({ pdfBase64: base64Pdf });
            } catch (e) {
                console.error("PDF base64 not found:", e);
                return res.status(500).json({ error: "PDF content not found in response" });
            }
        });
    });
});


// module.exports = router;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
