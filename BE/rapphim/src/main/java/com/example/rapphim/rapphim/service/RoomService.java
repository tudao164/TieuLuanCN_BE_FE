package com.example.rapphim.rapphim.service;

import com.example.rapphim.rapphim.dto.RoomLayoutDTO;
import com.example.rapphim.rapphim.entity.Room;
import com.example.rapphim.rapphim.entity.Seat;
import com.example.rapphim.rapphim.repository.RoomRepository;
import com.example.rapphim.rapphim.repository.SeatRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final SeatRepository seatRepository;
    private final ObjectMapper objectMapper;

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public Room getRoomById(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng với ID: " + id));
    }

    public Room createRoom(Room room) {
        // Set default values
        if (room.getTotalSeats() == null) {
            room.setTotalSeats(0);
        }
        if (room.getRoomType() == null) {
            room.setRoomType("STANDARD");
        }
        return roomRepository.save(room);
    }

    public Room updateRoom(Long id, Room room) {
        Room existingRoom = getRoomById(id);
        existingRoom.setRoomName(room.getRoomName());
        existingRoom.setLayout(room.getLayout());
        existingRoom.setRoomType(room.getRoomType());
        existingRoom.setTotalRows(room.getTotalRows());
        existingRoom.setTotalColumns(room.getTotalColumns());
        existingRoom.setRowLabels(room.getRowLabels());

        return roomRepository.save(existingRoom);
    }

    @Transactional
    public void deleteRoom(Long id) {
        Room room = getRoomById(id);
        roomRepository.delete(room);
    }

    public List<Seat> getSeatsByRoom(Long roomId) {
        Room room = getRoomById(roomId);
        return seatRepository.findByRoomOrderByRowLabelAscColumnNumberAsc(room);
    }

    // ===== PHƯƠNG THỨC QUAN TRỌNG: LƯU LAYOUT =====
    @Transactional
    public Room saveRoomLayout(Long roomId, RoomLayoutDTO layoutDTO) {
        Room room = getRoomById(roomId);

        // 1. Xóa tất cả ghế cũ
        seatRepository.deleteByRoom(room);

        // 2. Cập nhật thông tin phòng
        room.setTotalRows(layoutDTO.getTotalRows());
        room.setTotalColumns(layoutDTO.getTotalColumns());
        room.setRowLabels(layoutDTO.getRowLabels());
        room.setRoomType(layoutDTO.getRoomType() != null ? layoutDTO.getRoomType() : "STANDARD");

        // 3. Lưu layout dạng JSON
        try {
            String layoutJson = objectMapper.writeValueAsString(layoutDTO);
            room.setLayoutJson(layoutJson);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lưu layout JSON: " + e.getMessage());
        }

        // 4. Tạo ghế mới từ DTO
        List<Seat> newSeats = new ArrayList<>();
        int seatCount = 0;

        for (RoomLayoutDTO.SeatConfigDTO seatConfig : layoutDTO.getSeats()) {
            // Chỉ tạo ghế nếu exists = true
            if (seatConfig.getExists() != null && seatConfig.getExists()) {
                Seat seat = new Seat();
                seat.setSeatNumber(seatConfig.getSeatNumber());
                seat.setRowLabel(seatConfig.getRowLabel());
                seat.setColumnNumber(seatConfig.getColumnNumber());

                // Set seat type với giá trị mặc định
                String seatType = seatConfig.getSeatType();
                if (seatType == null) {
                    // Auto-detect seat type
                    if (Boolean.TRUE.equals(seatConfig.getIsCouple())) {
                        seatType = "COUPLE";
                    } else if (Boolean.TRUE.equals(seatConfig.getIsPremium())) {
                        seatType = "PREMIUM";
                    } else {
                        seatType = "STANDARD";
                    }
                }
                seat.setSeatType(seatType);

                // Set price multiplier
                if (seatConfig.getPriceMultiplier() != null) {
                    seat.setPriceMultiplier(seatConfig.getPriceMultiplier());
                } else {
                    // Auto-set price based on seat type
                    switch (seatType) {
                        case "VIP":
                            seat.setPriceMultiplier(1.5);
                            break;
                        case "PREMIUM":
                            seat.setPriceMultiplier(1.3);
                            break;
                        case "COUPLE":
                            seat.setPriceMultiplier(2.0);
                            break;
                        default:
                            seat.setPriceMultiplier(1.0);
                    }
                }

                // Parse status
                if (seatConfig.getStatus() != null) {
                    try {
                        seat.setStatus(Seat.Status.valueOf(seatConfig.getStatus()));
                    } catch (IllegalArgumentException e) {
                        seat.setStatus(Seat.Status.AVAILABLE);
                    }
                } else {
                    seat.setStatus(Seat.Status.AVAILABLE);
                }

                seat.setRoom(room);
                newSeats.add(seat);
                seatCount++;
            }
        }

        // 5. Lưu tất cả ghế
        if (!newSeats.isEmpty()) {
            seatRepository.saveAll(newSeats);
        }

        // 6. Cập nhật tổng số ghế
        room.setTotalSeats(seatCount);

        return roomRepository.save(room);
    }

    @Transactional
    public void deleteAllSeatsInRoom(Long roomId) {
        Room room = getRoomById(roomId);
        seatRepository.deleteByRoom(room);
        room.setTotalSeats(0);
        roomRepository.save(room);
    }

    @Transactional
    public List<Seat> createBulkSeats(Long roomId, List<Seat> seats) {
        Room room = getRoomById(roomId);

        // Parse seat number to extract row and column
        Pattern pattern = Pattern.compile("^([A-Z]+)(\\d+)$");

        seats.forEach(seat -> {
            seat.setRoom(room);

            // Auto-parse row and column if not provided
            if (seat.getRowLabel() == null || seat.getColumnNumber() == null) {
                Matcher matcher = pattern.matcher(seat.getSeatNumber());
                if (matcher.matches()) {
                    seat.setRowLabel(matcher.group(1));
                    seat.setColumnNumber(Integer.parseInt(matcher.group(2)));
                }
            }

            if (seat.getSeatType() == null) {
                seat.setSeatType("STANDARD");
            }
            if (seat.getPriceMultiplier() == null) {
                seat.setPriceMultiplier(1.0);
            }
        });

        List<Seat> savedSeats = seatRepository.saveAll(seats);

        // Update total seats
        room.setTotalSeats(seatRepository.countByRoom(room));
        roomRepository.save(room);

        return savedSeats;
    }

    // Lấy layout để hiển thị
    public RoomLayoutDTO getRoomLayout(Long roomId) {
        Room room = getRoomById(roomId);
        List<Seat> seats = seatRepository.findByRoomOrderByRowLabelAscColumnNumberAsc(room);

        RoomLayoutDTO dto = new RoomLayoutDTO();
        dto.setRoomID(room.getRoomID());
        dto.setRoomName(room.getRoomName());
        dto.setTotalRows(room.getTotalRows());
        dto.setTotalColumns(room.getTotalColumns());
        dto.setRowLabels(room.getRowLabels());
        dto.setRoomType(room.getRoomType());

        List<RoomLayoutDTO.SeatConfigDTO> seatConfigs = new ArrayList<>();
        for (Seat seat : seats) {
            RoomLayoutDTO.SeatConfigDTO config = new RoomLayoutDTO.SeatConfigDTO();
            config.setSeatNumber(seat.getSeatNumber());
            config.setRowLabel(seat.getRowLabel());
            config.setColumnNumber(seat.getColumnNumber());
            config.setSeatType(seat.getSeatType());
            config.setStatus(seat.getStatus().name());
            config.setPriceMultiplier(seat.getPriceMultiplier());
            config.setExists(true);
            config.setSeatID(seat.getSeatID());

            // Set additional flags
            config.setIsCouple("COUPLE".equals(seat.getSeatType()));
            config.setIsPremium("PREMIUM".equals(seat.getSeatType()));

            seatConfigs.add(config);
        }
        dto.setSeats(seatConfigs);

        return dto;
    }

    // Lấy thông tin phòng kèm layout
    public Room getRoomWithLayout(Long roomId) {
        Room room = getRoomById(roomId);

        // Nếu có layout JSON, parse và trả về
        if (room.getLayoutJson() != null && !room.getLayoutJson().isEmpty()) {
            try {
                RoomLayoutDTO layoutDTO = objectMapper.readValue(room.getLayoutJson(), RoomLayoutDTO.class);
                // Có thể set thêm thông tin nếu cần
            } catch (Exception e) {
                // Log error but don't throw
                System.err.println("Error parsing layout JSON: " + e.getMessage());
            }
        }

        return room;
    }
}