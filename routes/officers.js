const router = require("express").Router();
const officers = require("../models/officer.model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const appointmentImport = require("../models/appointment.model");
const { Officer, Slot, DateSchedule } = officers;
const { Appointment, Feedback } = appointmentImport;
const bcrypt = require('../bcrypt/bcrypt');

function createDate(date) {
	return new DateSchedule({
		date: date,
		slots: [
			new Slot({
				time: "14:00:00",
				isBooked: false,
			}),
			new Slot({
				time: "14:15:00",
				isBooked: false,
			}),
			new Slot({
				time: "14:30:00",
				isBooked: false,
			}),
			new Slot({
				time: "14:45:00",
				isBooked: false,
			}),
			new Slot({
				time: "15:00:00",
				isBooked: false,
			}),
			new Slot({
				time: "15:15:00",
				isBooked: false,
			}),
			new Slot({
				time: "15:30:00",
				isBooked: false,
			}),
			new Slot({
				time: "15:45:00",
				isBooked: false,
			}),
		],
	});
}

// To get all the officers
// **ONLY FOR TESTING**
router.route("/").get((req, res) => {
	Officer.find()
		.then((officers) => {
			res.json(officers);
		})
		.catch((err) => {
			res.status(400).json(`Error : ${err}`);
		});
});

// To add a officer
router.route("/add").post((req, res) => {
	const username = req.body.username; // Required.. can't be undefined
	const password = req.body.password;
	const name = req.body.name;
	const phoneNumber = req.body.phoneNumber;
	const specialization = req.body.specialization;
	const designation = req.body.designation;
	const feesPerSession = req.body.feesPerSession;

	const newofficer = new Officer({
		username,
		password,
		name,
		phoneNumber,
		specialization,
		designation,
		feesPerSession
	});

	newofficer
		.save()
		.then(() => {
			res.json("Officer added");
			// console.log(`${newofficer} added!`)
		})
		.catch((err) => {
			res.status(400).json(`Error : ${err}`);
			// console.log(err);
		});
});

// To update a officer
router.route("/update").put((req, res) => {
	const username = req.body.username; // Required.. can't be undefined

	Officer.findOne({ username: username }).then((officer) => {
		if (officer) {
			officer.name = req.body.name;
			officer.phoneNumber = req.body.phoneNumber;
			officer.specialization = req.body.specialization;
			officer.feesPerSession = req.body.feesPerSession;
			officer.designation = req.body.designation;

			officer
				.save()
				.then(() => {
					res.json("officer updated");
					// console.log(`${officer} updated!`)
				})
				.catch((err) => {
					res.status(400).json(`Error : ${err}`);
					// console.log(err);
				});
		}
	});
});

// officer login
router.route("/login").post(async (req, res) => {
	try {
		const username = req.body.username;

		// Password entered by the user
		const plainTextPassword = req.body.password;

		// Password Salt for hashing purpose
		const passwordSalt = process.env.PASSWORD_SALT;

		// Encrypted password after hashing operation
		const encryptedPassword = bcrypt.hash(plainTextPassword, passwordSalt)

		const officer = await Officer.findOne({
			username: username,
			password: encryptedPassword,
		});

		console.log(officer);

		if (officer === null) {
			return res.status(201).json({ message: "wrong username or password" });
		}

		// officer found, return the token to the client side
		const token = jwt.sign(
			JSON.stringify(officer),
			process.env.KEY, 
			{
				algorithm: process.env.ALGORITHM,
			}
		);

		return res.status(200).json({ token: token.toString() });

	} catch (err) {
		console.log(err);
		return res.status(400).json(err);
	}
});

// To get the slots available for the date
router.route("/get-slots").post(async (req, res) => {
	try {
		const id = req.body.officerId; // officer's id
		const date = req.body.date; // Date to book

		const officer = await Officer.findOne({ _id: id });

		// officer not found
		if (officer === null) {
			console.log("officer not found in the database!");
			return res.status(201).json({
				message: "officer not found in the database!",
			});
		}

		// officer found
		// Find the date
		let count = 0;
		for (const i of officer.dates) {
			if (i.date === date) {
				return res.status(200).json(i);
			}
			count++;
		}

		const oldLength = count;

		// Add new slots if date not found in the db
		const dateSchedule = createDate(date);
		const updatedOfficer = await Officer.findOneAndUpdate(
			{ _id: officer._id },
			{ $push: { dates: dateSchedule } },
			{ new: true }
		);

		if (updatedOfficer) {
			return res.status(200).json(updatedOfficer.dates[oldLength]);
		} else {
			const err = { err: "an error occurred!" };
			throw err;
		}
	} catch (err) {
		console.log(err);
		return res.status(400).json({
			message: err,
		});
	}
});

router.route("/book-slot").post((req, res) => {
	const citizenId = req.body.googleId; // citizen's google id
	const citizenName = req.body.citizenName; // citizen's name
	const reason=req.body.reason;
	const officerId = req.body.officerId; // officer's id 606460d2e0dd28cc76d9b0f3 
	const slotId = req.body.slotId; // Id of that particular slot
	const dateId = req.body.dateId; // Id of that particular date
	const meetLink = "";

	Officer.findOne({ _id: officerId }).then((officer) => {
		const date = officer.dates.id(dateId);
		const slot = date.slots.id(slotId);
		slot.isBooked = true;
		officer
			.save()
			.then(() => {
				// Create an entry in the appointment database
				const newAppointment = new Appointment({
					officerId,
					dateId,
					slotId,
					citizenId,
					date: date.date,
					slotTime: slot.time,
					officerName: officer.name,
					officerEmail: officer.email,
					citizenName: citizenName,
					reason:reason,
					googleMeetLink: meetLink,
					feedback: new Feedback()
				});

				console.log(newAppointment);

				newAppointment
					.save()
					.then((appointment) => {
						return res.status(200).json(appointment);
					})
					.catch((err) => {
						console.log(err);
						res.status(400).json(err);
					});
			})
			.catch((err) => {
				console.log(err);
				res.status(400).json({
					message: `An error occurred : ${err}`,
				});
			});
	});
});

router.route("/appointments").post(async (req, res) => {
	try {
		const officerId = req.body.officerId;
		const appointments = await Appointment.find({
			officerId: officerId,
		});
		// res.status(200).json(appointments);
		const sortedAppointments = appointments.sort((a, b) => {
			return (
				Date.parse(b.date + "T" + b.slotTime) -
				Date.parse(a.date + "T" + a.slotTime)
			);
		});

		res.status(200).json(sortedAppointments);
	} catch (err) {
		console.log(err);
		res.status(400).json(err);
	}
});

router.route("/appointment/:id").get(async (req, res) => {
	try {
		const appointmentId = req.params.id;
		const appointment = await Appointment.findOne({
			_id: appointmentId,
		});

		res.status(200).json(appointment);
	} catch (err) {
		console.log(err);
		res.status(400).json(err);
	}
});

router.route('/todays-appointments').post(async (req, res) => {
	try {
		const date = new Date()
		let currDate = date.getFullYear().toString()
		const month = date.getMonth() + 1
		const day = date.getDate()

		currDate += month < 10 ? ('-0' + month.toString()) : '-' + month.toString()
		currDate += day < 10 ? ('-0' + day.toString()) : '-' + day.toString()
		const officerId = req.body.officerId;

		const appointments = await Appointment.find({ officerId: officerId, date:{$gte: currDate} });

		const sortedAppointments = appointments.sort((a, b) => {
			return (
				Date.parse(a.date + "T" + a.slotTime) - Date.parse(b.date + "T" + b.slotTime)
			);
		});

		res.status(200).json(sortedAppointments);
	}
	catch (err) {
		console.log(err);
		res.status(400).json(err);
	}
})

router.route('/previous-appointments').post(async (req, res) => {
	try {
		const officerId = req.body.officerId;

		const appointments = await Appointment.find({ officerId: officerId });

		// Get current dateTime
		const date = new Date()
		let currDateTime = date.getFullYear().toString()
		const month = date.getMonth() + 1
		const day = date.getDate()
		const hour = date.getHours()
		const minutes = date.getMinutes()
		const seconds = date.getSeconds()

		currDateTime += month < 10 ? ('-0' + month.toString()) : '-' + month.toString()
		currDateTime += day < 10 ? ('-0' + day.toString()) : '-' + day.toString()
		currDateTime += hour < 10 ? ('T0' + hour.toString()) : 'T' + hour.toString()
		currDateTime += minutes < 10 ? (':0' + minutes.toString()) : ':' + minutes.toString()
		currDateTime += seconds < 10 ? (':0' + seconds.toString()) : ':' + seconds.toString()

		const filteredAppointments = appointments.filter((appointment) => {
			return Date.parse(currDateTime) >= Date.parse(appointment.date + 'T' + appointment.slotTime)
		})

		const sortedAppointments = filteredAppointments.sort((a, b) => {
			return Date.parse(b.date + 'T' + b.slotTime) - Date.parse(a.date + 'T' + a.slotTime)
		})

		res.status(200).json(sortedAppointments);
	}
	catch (err) {
		console.log(err);
		res.status(400).json(err);
	}
})

module.exports = router;
