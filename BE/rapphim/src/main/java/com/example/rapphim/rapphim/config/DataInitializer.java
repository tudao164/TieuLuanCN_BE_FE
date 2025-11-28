package com.example.rapphim.rapphim.config;

import com.example.rapphim.rapphim.entity.*;
import com.example.rapphim.rapphim.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private MovieRepository movieRepository;
    
    @Autowired
    private RoomRepository roomRepository;
    
    @Autowired
    private SeatRepository seatRepository;
    
    @Autowired
    private ShowtimeRepository showtimeRepository;
    
    @Autowired
    private ComboRepository comboRepository;
    
    @Autowired
    private PromotionRepository promotionRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // Tạo admin user nếu chưa tồn tại
        if (!userRepository.existsByEmail("admin@rapphim.com")) {
            User admin = new User();
            admin.setName("Admin");
            admin.setEmail("admin@rapphim.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(User.Role.ADMIN);
            userRepository.save(admin);
        }
        
        // Tạo staff user
        if (!userRepository.existsByEmail("staff@rapphim.com")) {
            User staff = new User();
            staff.setName("Staff");
            staff.setEmail("staff@rapphim.com");
            staff.setPassword(passwordEncoder.encode("staff123"));
            staff.setRole(User.Role.STAFF);
            userRepository.save(staff);
        }
        
        // Tạo customer user
        if (!userRepository.existsByEmail("customer@rapphim.com")) {
            User customer = new User();
            customer.setName("Customer");
            customer.setEmail("customer@rapphim.com");
            customer.setPassword(passwordEncoder.encode("customer123"));
            customer.setRole(User.Role.CUSTOMER);
            userRepository.save(customer);
        }
        
        // Tạo phim mẫu
        if (movieRepository.count() == 0) {
            Movie movie1 = new Movie();
            movie1.setTitle("Spider-Man: No Way Home");
            movie1.setGenre("Action, Adventure, Fantasy");
            movie1.setDuration(148);
            movie1.setDescription("With Spider-Man's identity now revealed, Peter asks Doctor Strange for help.");
            movie1.setReleaseDate(LocalDate.of(2021, 12, 17));
            movie1.setTotalTicketLove(0);
            movieRepository.save(movie1);
            
            Movie movie2 = new Movie();
            movie2.setTitle("Avengers: Endgame");
            movie2.setGenre("Action, Adventure, Drama");
            movie2.setDuration(181);
            movie2.setDescription("After the devastating events of Infinity War, the Avengers assemble once more.");
            movie2.setReleaseDate(LocalDate.of(2019, 4, 26));
            movie2.setTotalTicketLove(0);
            movieRepository.save(movie2);
        }
        
        // Tạo phòng chiếu
        if (roomRepository.count() == 0) {
            Room room1 = new Room();
            room1.setRoomName("Theater 1");
            room1.setTotalSeats(50);
            room1.setLayout("Standard");
            Room savedRoom1 = roomRepository.save(room1);
            
            // Tạo ghế cho phòng 1
            for (int i = 1; i <= 50; i++) {
                Seat seat = new Seat();
                seat.setSeatNumber("A" + i);
                seat.setStatus(Seat.Status.AVAILABLE);
                seat.setRoom(savedRoom1);
                seatRepository.save(seat);
            }
            
            Room room2 = new Room();
            room2.setRoomName("Theater 2");
            room2.setTotalSeats(30);
            room2.setLayout("VIP");
            Room savedRoom2 = roomRepository.save(room2);
            
            // Tạo ghế cho phòng 2
            for (int i = 1; i <= 30; i++) {
                Seat seat = new Seat();
                seat.setSeatNumber("B" + i);
                seat.setStatus(Seat.Status.AVAILABLE);
                seat.setRoom(savedRoom2);
                seatRepository.save(seat);
            }
        }
        
        // // Tạo xuất chiếu
        // if (showtimeRepository.count() == 0 && movieRepository.count() > 0 && roomRepository.count() > 0) {
        //     Movie movie = movieRepository.findAll().get(0);
        //     Room room = roomRepository.findAll().get(0);
            
        //     Showtime showtime1 = new Showtime();
        //     showtime1.setStartTime(LocalTime.of(14, 0));
        //     showtime1.setEndTime(LocalTime.of(16, 30));
        //     showtime1.setShowtimeDate(LocalDate.now().plusDays(1));
        //     showtime1.setDescription("Matinee showing");
        //     showtime1.setMovie(movie);
        //     showtime1.setRoom(room);
        //     showtimeRepository.save(showtime1);
            
        //     Showtime showtime2 = new Showtime();
        //     showtime2.setStartTime(LocalTime.of(19, 0));
        //     showtime2.setEndTime(LocalTime.of(21, 30));
        //     showtime2.setShowtimeDate(LocalDate.now().plusDays(1));
        //     showtime2.setDescription("Evening showing");
        //     showtime2.setMovie(movie);
        //     showtime2.setRoom(room);
        //     showtimeRepository.save(showtime2);
        // }
        
        // Tạo combo
        if (comboRepository.count() == 0) {
            Combo combo1 = new Combo();
            combo1.setNameCombo("Popcorn + Drink");
            combo1.setPrice(80000.0);
            combo1.setDescription("Large popcorn and soft drink");
            comboRepository.save(combo1);
            
            Combo combo2 = new Combo();
            combo2.setNameCombo("Family Pack");
            combo2.setPrice(150000.0);
            combo2.setDescription("2 Large popcorns, 4 drinks, and nachos");
            comboRepository.save(combo2);
        }
        
        // Tạo khuyến mãi
        if (promotionRepository.count() == 0) {
            Promotion promotion1 = new Promotion();
            promotion1.setCode("WELCOME10");
            promotion1.setDiscount(10.0);
            promotion1.setStartDate(LocalDate.now());
            promotion1.setEndDate(LocalDate.now().plusDays(30));
            promotionRepository.save(promotion1);
            
            Promotion promotion2 = new Promotion();
            promotion2.setCode("STUDENT20");
            promotion2.setDiscount(20.0);
            promotion2.setStartDate(LocalDate.now());
            promotion2.setEndDate(LocalDate.now().plusDays(60));
            promotionRepository.save(promotion2);
        }
    }
}