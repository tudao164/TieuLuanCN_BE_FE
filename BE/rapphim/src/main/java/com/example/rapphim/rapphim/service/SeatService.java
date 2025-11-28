package com.example.rapphim.rapphim.service;

import com.example.rapphim.rapphim.entity.Seat;
import com.example.rapphim.rapphim.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class SeatService {

    private final SeatRepository seatRepository;

    public List<Seat> getAllSeats() {
        return seatRepository.findAll();
    }

    public Seat getSeatById(Long id) {
        return seatRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ghế với ID: " + id));
    }

    @Transactional
    public Seat createSeat(Seat seat) {
        // Auto-parse row and column from seatNumber
        if (seat.getRowLabel() == null || seat.getColumnNumber() == null) {
            parseSeatNumber(seat);
        }

        if (seat.getSeatType() == null) {
            seat.setSeatType("STANDARD");
        }
        if (seat.getPriceMultiplier() == null) {
            seat.setPriceMultiplier(1.0);
        }

        return seatRepository.save(seat);
    }

    @Transactional
    public Seat updateSeat(Long id, Seat seat) {
        Seat existingSeat = getSeatById(id);
        existingSeat.setSeatNumber(seat.getSeatNumber());
        existingSeat.setStatus(seat.getStatus());
        existingSeat.setSeatType(seat.getSeatType());
        existingSeat.setPriceMultiplier(seat.getPriceMultiplier());

        // Re-parse if seat number changed
        if (!existingSeat.getSeatNumber().equals(seat.getSeatNumber())) {
            parseSeatNumber(existingSeat);
        }

        return seatRepository.save(existingSeat);
    }

    @Transactional
    public void deleteSeat(Long id) {
        Seat seat = getSeatById(id);
        seatRepository.delete(seat);
    }

    @Transactional
    public Seat updateSeatStatus(Long id, Seat.Status status) {
        Seat seat = getSeatById(id);
        seat.setStatus(status);
        return seatRepository.save(seat);
    }

    // Helper method to parse seat number
    private void parseSeatNumber(Seat seat) {
        Pattern pattern = Pattern.compile("^([A-Z]+)(\\d+)$");
        Matcher matcher = pattern.matcher(seat.getSeatNumber());

        if (matcher.matches()) {
            seat.setRowLabel(matcher.group(1));
            seat.setColumnNumber(Integer.parseInt(matcher.group(2)));
        }
    }
}