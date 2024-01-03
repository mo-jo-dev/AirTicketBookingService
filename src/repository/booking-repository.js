const { ValidationError, AppError } = require('../utils/errors/index');
const { Booking } = require('../models/index');
const { StatusCodes} = require('http-status-codes');

class BookingRepository{
    async create(data){
        try {
            const booking = await Booking.create(data);
            return booking;
        } catch (error) {
            if(error.name == 'SequelizeValidationError'){
                throw new ValidationError(error);
            }
            throw new AppError(
                'RepositoryError',
                'Cannot Create Booking',
                'There was some issue creating the booking, please try again',
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    async update(data, userId){
        try {
            const result = await Booking.update(data,{
                where: {
                    id: userId
                }
            });
            return result;
        } catch (error) {
            
        }
    }

}

module.exports = BookingRepository;