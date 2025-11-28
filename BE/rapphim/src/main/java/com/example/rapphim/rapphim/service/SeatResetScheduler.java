package com.example.rapphim.rapphim.service;

import com.example.rapphim.rapphim.entity.Seat;
import com.example.rapphim.rapphim.entity.Showtime;
import com.example.rapphim.rapphim.repository.SeatRepository;
import com.example.rapphim.rapphim.repository.ShowtimeRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@Slf4j
public class SeatResetScheduler {

    @Autowired
    private ShowtimeRepository showtimeRepository;

    @Autowired
    private SeatRepository seatRepository;

    // Chay moi 1 phut de kiem tra va reset ghe cua cac suat chieu da ket thuc
    // Cron expression: "0 * * * * *" = Chay vao giay 0 moi phut
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void resetSeatsForFinishedShowtimes() {
        try {
            LocalDate currentDate = LocalDate.now();
            LocalTime currentTime = LocalTime.now();

            log.info("[SEAT RESET] Bat dau kiem tra suat chieu da ket thuc - {}, {}", currentDate, currentTime);

            // Lay tat ca suat chieu da ket thuc
            List<Showtime> finishedShowtimes = showtimeRepository.findFinishedShowtimes(currentDate, currentTime);

            if (finishedShowtimes.isEmpty()) {
                log.info("[SEAT RESET] Khong co suat chieu nao da ket thuc");
                return;
            }

            log.info("[SEAT RESET] Tim thay {} suat chieu da ket thuc", finishedShowtimes.size());

            int totalSeatsReset = 0;

            for (Showtime showtime : finishedShowtimes) {
                // Lay tat ca ghe cua phong chieu trong suat chieu nay
                List<Seat> roomSeats = seatRepository.findByRoom(showtime.getRoom());

                // Reset tat ca ghe dang BOOKED ve AVAILABLE (giu nguyen MAINTENANCE va DISABLED)
                int seatsResetInThisShowtime = 0;
                for (Seat seat : roomSeats) {
                    if (seat.getStatus() == Seat.Status.BOOKED) {
                        seat.setStatus(Seat.Status.AVAILABLE);
                        seatRepository.save(seat);
                        seatsResetInThisShowtime++;
                        totalSeatsReset++;
                        
                        log.debug("[SEAT RESET] Reset ghe {} tu BOOKED -> AVAILABLE", seat.getSeatNumber());
                    }
                }

                if (seatsResetInThisShowtime > 0) {
                    log.info("[SEAT RESET] Da reset {} ghe cho suat chieu ID={}, Phim: {}, Phong: {}, Ngay: {}, Gio: {}-{}",
                            seatsResetInThisShowtime,
                            showtime.getShowtimeID(),
                            showtime.getMovie().getTitle(),
                            showtime.getRoom().getRoomName(),
                            showtime.getShowtimeDate(),
                            showtime.getStartTime(),
                            showtime.getEndTime());
                } else {
                    log.debug("[SEAT RESET] Khong co ghe nao can reset cho suat chieu ID={}", showtime.getShowtimeID());
                }
            }

            log.info("[SEAT RESET] Hoan thanh! Tong cong da reset {} ghe tu {} suat chieu",
                    totalSeatsReset, finishedShowtimes.size());

        } catch (Exception e) {
            log.error("[SEAT RESET] Loi khi reset ghe: {}", e.getMessage(), e);
        }
    }

    // Phuong thuc de test thu cong (co the goi qua API neu can)
    public void manualResetSeats() {
        log.info("[SEAT RESET] Thuc hien reset ghe thu cong");
        resetSeatsForFinishedShowtimes();
    }
}
