const axios = require('axios');

const { BookingRepository } = require('../repository/index');
const { FLIGHT_SERVICE_PATH, USER_SERVICE_PATH } = require('../config/serverConfig');
const { ServiceError } = require('../utils/errors/index');

const { createChannel, publishMessage } = require('../utils/messageQueue');
const { REMINDER_BINDING_KEY } = require('../config/serverConfig');
class BookingService{
    constructor(){
        this.bookingRepository = new BookingRepository();
    }

    async createBooking(data){
        try {
            const flightId = data.flightId;
            const getFlightRequestURL = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`;
            const response = await axios.get(getFlightRequestURL);
            const flightData = response.data.data;
            let priceOfTheFlight = flightData.price;
            if(data.noOfSeats > flightData.totalSeats){
                throw new ServiceError(
                    'Something Went wrong in the booking process', 
                    'Insufficient seats in the flight'
                ); 
            }
            const totalCost = priceOfTheFlight * data.noOfSeats;
            const bookingPayload = {...data, totalCost};
            const booking = await this.bookingRepository.create(bookingPayload);
            const updateFlightRequestURL = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${booking.flightId}`;
            await axios.patch(updateFlightRequestURL, {totalSeats: flightData.totalSeats - booking.noOfSeats}) ;
            const finalBooking = await this.bookingRepository.update(booking.id, {status: "Booked"});   
            
            const getUserRequestURL = `${USER_SERVICE_PATH}/api/v1/get/${data.userId}`;
            const res = await axios.get(getUserRequestURL);
            const userData = res.data.data;
            console.log(userData.email);
            this.sendConfirmationMail(userData.email);
            
            return finalBooking;
        } catch (error) {
            if(error.name == 'RepositoryError' || error.name == 'ValidationeError'){
                throw error;
            }
            throw new ServiceError(); 
        }
    }

    async sendConfirmationMail(email){
        try {
            const channel = await createChannel();
            const payload = {
                data: {
                    subject: 'Hooray! Your ticket has been booked',
                    content: `Dear ${email} \n Thank you for bookin from Mohit's Airline Platform, your ticket will be shared soon. \n Thank You `,
                    recepientEmail: email,
                    notificationTime: new Date()
                },
                service: 'CREATE_TICKET'  
        };
            publishMessage(channel, REMINDER_BINDING_KEY, JSON.stringify(payload));
            return 'Successfully published the event';
        } catch (error) {
            throw error;
        }
    }

}

module.exports = BookingService;